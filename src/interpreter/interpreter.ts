/* tslint:disable:max-classes-per-file */
import * as es from 'estree'

import { createGlobalEnvironment } from '../createContext'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Context, Environment, Value } from '../types'
import { Stack } from '../types'
import { evaluateBinaryExpression, evaluateUnaryExpression } from '../utils/operators'
import * as rttc from '../utils/rttc'

const step_limit = 1000000
let A = new Stack<any>()
let S = new Stack<Value>()
let E = createGlobalEnvironment() 

class Thunk {
  public value: Value
  public isMemoized: boolean
  constructor(public exp: es.Node, public env: Environment) {
    this.isMemoized = false
    this.value = null
  }
}

function* forceIt(val: any, context: Context): Value {
  if (val instanceof Thunk) {
    if (val.isMemoized) return val.value

    pushEnvironment(context, val.env)
    const evalRes = yield* actualValue(val.exp, context)
    popEnvironment(context)
    val.value = evalRes
    val.isMemoized = true
    return evalRes
  } else return val
}

export function* actualValue(exp: es.Node, context: Context): Value {
  const evalResult = yield* evaluate(exp, context)
  const forced = yield* forceIt(evalResult, context)
  return forced
}

const handleRuntimeError = (context: Context, error: RuntimeSourceError): never => {
  context.errors.push(error)
  context.runtime.environments = context.runtime.environments.slice(
    -context.numberOfOuterEnvironments
  )
  throw error
}

function* visit(context: Context, node: es.Node) {
  context.runtime.nodes.unshift(node)
  yield context
}

function* leave(context: Context) {
  context.runtime.break = false
  context.runtime.nodes.shift()
  yield context
}

const popEnvironment = (context: Context) => context.runtime.environments.shift()
export const pushEnvironment = (context: Context, environment: Environment) => {
  context.runtime.environments.unshift(environment)
  context.runtime.environmentTree.insert(environment)
}

export type Evaluator<T extends es.Node> = (node: T, context: Context) => IterableIterator<Value>

function* evaluateBlockSatement(context: Context, node: es.BlockStatement) {
  let result
  for (const statement of node.body) {
    result = yield* evaluate(statement, context)
  }
  return result
}

/**
 * WARNING: Do not use object literal shorthands, e.g.
 *   {
 *     *Literal(node: es.Literal, ...) {...},
 *     *ThisExpression(node: es.ThisExpression, ..._ {...},
 *     ...
 *   }
 * They do not minify well, raising uncaught syntax errors in production.
 * See: https://github.com/webpack/webpack/issues/7566
 */
// tslint:disable:object-literal-shorthand
// prettier-ignore
export const evaluators: { [nodeType: string]: Evaluator<es.Node> } = {
  /** Simple Values */
  Literal: function* (node: es.Literal, _context: Context) {
    return {
      tag: 'lit',
      val: node.value
    }
  },

  TemplateLiteral: function* (node: es.TemplateLiteral) {
    // Expressions like `${1}` are not allowed, so no processing needed
    return node.quasis[0].value.cooked
  },

  ThisExpression: function* (node: es.ThisExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ArrayExpression: function* (node: es.ArrayExpression, context: Context) {
    const elems = []
    for (let i = 0; i < node.elements.length; i++) {
      const elem = yield* evaluators[node.elements[i]!.type](node.elements[i]!, context)
      elems.push(elem)
    }
    return node.leadingComments![0].value === "list" 
        ? { tag: 'list_lit', elems }
        : { tag: 'tuple_lit', elems }
  },

  FunctionExpression: function* (node: es.FunctionExpression, context: Context) {
    return {
      tag: 'lam', 
      params: [yield* evaluators[node.params[0].type](node.params[0], context)],
      body: yield* evaluators[node.body.type](node.body, context)
    }
  },

  ArrowFunctionExpression: function* (node: es.ArrowFunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  Identifier: function* (node: es.Identifier, context: Context) {
    return {
      tag: 'id', 
      sym: node.name
    }
  },

  CallExpression: function* (node: es.CallExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  NewExpression: function* (node: es.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
    return {
      tag: 'unop',
      sym: node.operator, 
      arg: yield* evaluators[node.argument.type](node.argument, context)
    }
  },

  BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
    const frst = yield* evaluators[node.right.type](node.right, context)
    const scnd = yield* evaluators[node.left.type](node.left, context)

    if (node.operator === '|') { // List binary expressions
      const tag = node.leadingComments![0].value
      return {
        tag: tag,
        frst,
        scnd
      }
    }

    return {
      tag: 'binop',
      sym: node.operator,
      frst,
      scnd
    }
  },

  MemberExpression: function* (node: es.MemberExpression, context: Context) {
    const expr = node.object.type === "ArrayExpression" 
            ? yield* evaluators[node.object.type](node.object, context)
            : node.object
    return {
      tag: 'record',
      record: node.property,
      expr
    }
  },

  ConditionalExpression: function* (node: es.ConditionalExpression, context: Context) {
    const test = yield* actualValue(node.test, context)
    const cons = yield* actualValue(node.consequent, context)
    const alt = yield* actualValue(node.alternate, context)
    const error = rttc.checkIfStatement(node, test)
    if (error) {
      return handleRuntimeError(context, error)
    }
    
    return test ? cons : alt
  },

  LogicalExpression: function* (node: es.LogicalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  VariableDeclaration: function* (node: es.VariableDeclaration, context: Context) {
    console.log(node)
    // const decl = node.declarations[0]
    // const expr = yield* evaluators[decl.init!.type](decl.init!, context)
    const ids = [] 
    const exprs = [] 
    for (const decl of node.declarations) {
      ids.push(decl.id.type === "Identifier" ? decl.id.name : null) // assume that vars are declared with identifier only
      exprs.push(yield* evaluators[decl.init!.type](decl.init!, context))
    }
    return {
      tag: 'var',
      ids, 
      exprs
    }
  },

  ContinueStatement: function* (_node: es.ContinueStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  BreakStatement: function* (_node: es.BreakStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  ForStatement: function* (node: es.ForStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  AssignmentExpression: function* (node: es.AssignmentExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  FunctionDeclaration: function* (node: es.FunctionDeclaration, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  IfStatement: function* (node: es.IfStatement | es.ConditionalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ExpressionStatement: function* (node: es.ExpressionStatement, context: Context) {
    return yield* evaluators[node.expression.type](node.expression, context)
  },

  SequenceExpression: function* (node: es.SequenceExpression, context: Context) {
    const body = []
    for (let i = 0; i < node.expressions.length; i++) {
      const expr = node.expressions[i]
      body.push(yield* evaluators[expr.type](expr, context))
    }
    const locals = (node as any).locals 
    return locals ? {
      tag: 'blk', 
      body: { 
        tag: 'seq', 
        body: [yield* evaluators[locals.type](locals, context), ...body] 
      }
    } : {
      tag: 'seq',
      body,
    }
  },

  ReturnStatement: function* (node: es.ReturnStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  WhileStatement: function* (node: es.WhileStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  BlockStatement: function* (node: es.BlockStatement, context: Context) {
    const stmts = []; 
    for (let i = 0; i < node.body.length; i++) {
      const expr = node.body[i]
      stmts.push(yield* evaluators[expr.type](expr, context))
    }
    const jsonBody = node.body.length > 1 ? {
      tag: 'seq',
      body: stmts
    } : stmts[0]
    
    return {
      tag: 'blk',
      body: jsonBody
    }
  },

  Program: function* (node: es.BlockStatement, context: Context) {
    const progBlk = node.body[0]
    return yield* evaluators[progBlk.type](progBlk, context); 
  }
  
}

const microcode : { [tag: string]: Function } = {
  blk: (cmd: { body: any }) => {
    if (A.size() > 0) {
      A.push({tag: 'env_i', env: E}) 
    }
    const body = cmd.body 
    A.push(body)

    // extend environment by 1 frame for block 
    E = {
      head: {}, 
      tail: E, 
      id: E.id,  
      name: 'program'
    }
  }, 
  seq: (cmd: { body: any[] }) => {
    for (let i = cmd.body.length - 1; i >= 0; i--) {
      const expr = cmd.body[i]
      A.push(expr)
    }
  },
  lit: (cmd: { val: any }) => {
    S.push(cmd.val)
  },
  id: (cmd: { sym: string }) => {
    let env: Environment | null = E 
    while (env) {
      const frame = env.head 
      if (frame.hasOwnProperty(cmd.sym)) {
        return S.push(frame[cmd.sym])
      }
      env = env.tail 
    }
    console.log("error: cannot find variable in env") 
  },
  binop: (cmd: { sym: es.BinaryOperator; scnd: any; frst: any }) => {
    A.push({
      tag: 'binop_i', 
      sym: cmd.sym
    })
    A.push(cmd.frst)
    A.push(cmd.scnd)
  }, 
  unop: (cmd: { sym: es.BinaryOperator; arg: any }) => {
    A.push({
      tag: 'unop_i',
      sym: cmd.sym
    })
    A.push(cmd.arg)
  }, 
  var: (cmd: { ids: string[], exprs: any[] }) => {
    // A.push({ tag: 'lit', val: undefined })
    // A.push({ tag: 'pop_i'})
    for (let i = cmd.exprs.length - 1; i >= 0; i--) {
      A.push({ tag: 'assmt', sym: cmd.ids[i], expr: cmd.exprs[i] })
    }
    // A.push({ tag: 'assmt', sym: cmd.id, expr: cmd.expr })
  },
  assmt: (cmd: { sym: string, expr: any }) => {
    A.push({ tag: 'assmt_i', sym: cmd.sym }) 
    A.push(cmd.expr) 
  }, 
  lam: (cmd: { params: any[], body: es.BlockStatement }) => {
    S.push({ tag: 'closure', params: cmd.params.map(param => param.sym), body: cmd.body, env: E})
  },
  list_lit: (cmd: {elems: any[]}) => {
    A.push({ tag: 'list_lit_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  list_merge: (cmd: { scnd: any; frst: any }) => {
    A.push({
      tag: 'list_merge_i', 
    })
    A.push(cmd.frst)
    A.push(cmd.scnd)
  },
  list_append: (cmd: { scnd: any; frst: any }) => {
    A.push({
      tag: 'list_append_i', 
    })
    A.push(cmd.frst)
    A.push(cmd.scnd)
  },
  tuple_lit: (cmd: {elems: any[]}) => {
    A.push({ tag: 'tuple_lit_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  record: (cmd: {record: any, expr: any}) => {
    const index = cmd.record.value - 1 // input is 1-indexed
    A.push({tag: 'record_i', index})

    if (cmd.expr.tag === 'tuple_lit') {
      A.push(cmd.expr)
    }

    if (cmd.expr.type === 'Identifier') {
      A.push({tag: 'id', sym: cmd.expr.name})
    }
  },
  binop_i: (cmd: { sym: es.BinaryOperator }) => {
    const right = S.pop() 
    const left = S.pop() 
    S.push(evaluateBinaryExpression(cmd.sym, left, right))
  },
  unop_i: (cmd: { sym: es.UnaryOperator }) => {
    const arg = S.pop()
    S.push(evaluateUnaryExpression(cmd.sym, arg))
  },
  env_i: (cmd: { env: Environment }) => {
    E = cmd.env 
  },
  assmt_i: (cmd: { sym: string }) => {
    E.head[cmd.sym] = S.peek() 
  },
  list_lit_i: (cmd: { len: number }) => {
    const list = []
    for (let i = 0; i < cmd.len; i++) {
      list.push(S.pop())
    }
    S.push(list)
  },
  list_merge_i: () => {
    const scnd = S.pop()
    const frst = S.pop()

    //TODO: check both is list
    scnd.forEach((x: any) => frst.push(x))

    S.push(frst)
  },
  list_append_i: () => {
    const scnd = S.pop()
    const frst = S.pop()

    //TODO: check all are same type
    S.push([frst, scnd])
  },
  tuple_lit_i: (cmd: { len: number }) => {
    const list = []
    for (let i = 0; i < cmd.len; i++) {
      list.push(S.pop())
    }
    S.push(list)
  },
  record_i: (cmd : { index: number }) => {
    const tuple = S.pop()

    if (cmd.index < 0 || cmd.index >= tuple.length) {
      throw Error("index out of bounds")
    }

    S.push(tuple[cmd.index])
  }
}
// tslint:enable:object-literal-shorthand

export function* evaluate(node: es.Node, context: Context) : any{
  A = new Stack<any>()
  S = new Stack<Value>()
  E = createGlobalEnvironment() 
  console.log("=====START EVALUATION=====")
  A.push(yield* evaluators[node.type](node, context))
  let i = 0; 
  while (i < step_limit) {
    if (A.size() === 0) break 
    const cmd = A.pop()
    console.log("\n=====instruction====")
    console.log(cmd)
    if (cmd && microcode.hasOwnProperty(cmd.tag)) {
      console.log("stash:")
      S.print() // print stash
      microcode[cmd.tag](cmd)
    } else {
      console.log("error")
    }
    i++; 
  }

  // const result = yield* evaluators[node.type](node, context)
  yield* leave(context)
  console.log("\n=====EXIT EVALUATION=====\n")
  const r = S.pop(); 
  return r
}
