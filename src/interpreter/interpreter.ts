/* tslint:disable:max-classes-per-file */
import * as es from 'estree'

import { createGlobalEnvironment } from '../createContext'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Context, Environment, TypedValue, Value } from '../types'
import { Stack } from '../types'
import { binaryOp, unaryOp } from '../utils/operators'
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
    const tag = node.leadingComments![0].value

    for (let i = 0; i < node.elements.length; i++) {
      const elem = yield* evaluators[node.elements[i]!.type](node.elements[i]!, context)
      elems.push(elem)
    }

    return {
      tag, 
      elems,
      node,
      loc: node.loc
    }
  },

  FunctionExpression: function* (node: es.FunctionExpression, context: Context) {
    const params = [] 
    for (let i = 0; i < node.params.length; i++) {
      params.push(yield* evaluators[node.params[i].type](node.params[i], context))
    }
    return {
      tag: 'lam', 
      params,
      body: yield* evaluators[node.body.type](node.body, context),
      id: node.id ? yield* evaluators[node.id.type](node.id, context) : node.id
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
    const args = [] 
    for (let i = 0; i < node.arguments.length; i++) { 
      const arg = node.arguments[i] 
      args.push(yield* evaluators[arg.type](arg, context))
    }
    return {
      tag: 'app', 
      fun: yield* evaluators[node.callee.type](node.callee, context), 
      args
    }
  },

  NewExpression: function* (node: es.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
    return {
      tag: 'unop',
      sym: node.operator, 
      arg: yield* evaluators[node.argument.type](node.argument, context),
      loc: node.loc
    }
  },

  BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
    const frst = yield* evaluators[node.right.type](node.right, context)
    const scnd = yield* evaluators[node.left.type](node.left, context)

    return {
      tag: 'binop',
      sym: node.operator,
      frst,
      scnd,
      loc: node.loc
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
    return {
      tag: 'cond_expr', 
      pred: yield* evaluators[node.test.type](node.test, context),
      cons: yield* evaluators[node.consequent.type](node.consequent, context),
      alt: yield* evaluators[node.alternate.type](node.alternate, context),
      node: node 
    }
  },

  LogicalExpression: function* (node: es.LogicalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  VariableDeclaration: function* (node: es.VariableDeclaration, context: Context) {
    // const decl = node.declarations[0]
    // const expr = yield* evaluators[decl.init!.type](decl.init!, context)
    const ids = [] 
    const exprs = []
    let localStartIdx = null 
    let localDecs = null 
    let localArity = null 

    for (let i = 0; i < node.declarations.length; i++) {
      const decl = node.declarations[i]
      ids.push(decl.id.type === "Identifier" ? decl.id.name : null) // assume that vars are declared with identifier only

      // deal with local declarations
      const locals = (decl as any).locals 
      if (locals) {
        localStartIdx = i
        localDecs = yield* evaluators[locals.decs.type](locals.decs, context)
        localArity = locals.arity 
      }
      exprs.push(yield* evaluators[decl.init!.type](decl.init!, context))
    }
    return {
      tag: 'var',
      ids, 
      exprs,
      localStartIdx,
      localDecs,
      localArity
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

const microcode: { [tag: string]: Function } = {
  blk: (cmd: { body: any; isCheck: boolean }) => {
    if (A.size() > 0) {
      A.push({ tag: 'env_i', env: E })
    }
    const body = cmd.body
    body['isCheck'] = cmd.isCheck
    A.push(body)

    // extend environment by 1 frame for block
    E = {
      head: {},
      tail: E,
      id: E.id,
      name: 'program'
    }
  },
  seq: (cmd: { body: any[]; isCheck: boolean }) => {
    for (let i = cmd.body.length - 1; i >= 0; i--) {
      const expr = cmd.body[i]
      expr['isCheck'] = cmd.isCheck
      A.push(expr)
    }
  },
  lit: (cmd: { val: any; isCheck: boolean }) => {
    if (!cmd.isCheck) {
      return S.push(rttc.getTypedLiteral(cmd.val))
    }
  },
  id: (cmd: { sym: string; isCheck: boolean }) => {
    let env: Environment | null = E
    while (env) {
      const frame = env.head
      if (frame.hasOwnProperty(cmd.sym)) {
        return !cmd.isCheck && S.push(frame[cmd.sym])
      }
      env = env.tail
    }
    throw Error(`Unbound variable ${cmd.sym}`)
  },
  binop: (cmd: {
    sym: es.BinaryOperator
    scnd: any
    frst: any
    loc: es.SourceLocation
    isCheck: boolean
  }) => {
    if (!cmd.isCheck) {
      A.push({
        tag: 'binop_i',
        sym: cmd.sym,
        loc: cmd.loc
      })
    }
    cmd.frst['isCheck'] = cmd.isCheck
    cmd.scnd['isCheck'] = cmd.isCheck
    A.push(cmd.frst)
    A.push(cmd.scnd)
  },
  unop: (cmd: { sym: es.BinaryOperator; arg: any; loc: es.SourceLocation; isCheck: boolean }) => {
    if (!cmd.isCheck) {
      A.push({
        tag: 'unop_i',
        sym: cmd.sym,
        loc: cmd.loc
      })
    }
    cmd.arg['isCheck'] = cmd.isCheck
    A.push(cmd.arg)
  },
  var: (cmd: {
    ids: string[]
    exprs: any[]
    localStartIdx: number
    localArity: number
    localDecs: any
    isCheck: boolean
  }) => {
    // A.push({ tag: 'lit', val: undefined })
    // A.push({ tag: 'pop_i'})
    for (let i = cmd.exprs.length - 1; i >= 0; i--) {
      if (cmd.localStartIdx !== null && i === cmd.localStartIdx + cmd.localArity - 1) {
        // restores the original env after 'local...in...end' is evaluated
        A.push({ tag: 'env_i', env: E })
      }

      A.push({
        tag: 'assmt',
        sym: cmd.ids[i],
        expr: cmd.exprs[i],
        // frameOffset to skip the temp frame (if declaration is within 'local...in<HERE>end')
        frameOffset: i >= cmd.localStartIdx && i < cmd.localStartIdx + cmd.localArity ? 1 : 0,
        isCheck: cmd.isCheck
      })

      if (cmd.localStartIdx !== null && i === cmd.localStartIdx) {
        // extend current env to temporarily store local declarations (i.e. 'local<THESE>in...end')
        // extended env will be used to eval declarations within 'local...in<HERE>end' only
        A.push(cmd.localDecs)
        A.push({
          tag: 'env_i',
          env: {
            head: {},
            tail: E,
            id: E.id,
            name: 'program'
          }
        })
      }
    }
  },
  assmt: (cmd: { sym: string; expr: any; frameOffset: number; isCheck: boolean }) => {
    A.push({ tag: 'assmt_i', sym: cmd.sym, frameOffset: cmd.frameOffset })
    cmd.expr['isCheck'] = cmd.isCheck
    A.push(cmd.expr)
  },
  lam: (cmd: { params: any[]; body: es.BlockStatement; id: any }) => {
    A.push({ tag: 'closure_i', params: cmd.params.map(param => param.sym), body: cmd.body, env: E })

    // check vars within function
    if (A.size() > 0) {
      A.push({ tag: 'env_i', env: E })
    }

    const body = { ...cmd.body, isCheck: true }
    A.push(body)

    // extend environment by 1 frame for block
    const head = {}
    cmd.params.forEach(param => (head[param.sym] = null))
    if (cmd.id) {
      // allows recursive functions (for 'fun' declarations only)
      head[cmd.id.sym] = null
    }
    E = {
      head,
      tail: E,
      id: E.id,
      name: 'program'
    }
  },
  list_lit: (cmd: { elems: any[]; isCheck: boolean; node: es.ArrayExpression }) => {
    !cmd.isCheck && A.push({ tag: 'list_lit_i', len: cmd.elems.length, node: cmd.node })
    cmd.elems.forEach(x => {
      x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  list_merge: (cmd: { elems: any[]; isCheck: boolean; node: es.ArrayExpression }) => {
    !cmd.isCheck && A.push({ tag: 'list_merge_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  list_append: (cmd: {
    elems: any[]
    isCheck: boolean
    node: es.ArrayExpression
    loc: es.SourceLocation
  }) => {
    !cmd.isCheck && A.push({ tag: 'list_append_i', loc: cmd.loc })
    cmd.elems.forEach(x => {
      x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  tuple_lit: (cmd: { elems: any[]; isCheck: boolean; node: es.ArrayExpression }) => {
    !cmd.isCheck && A.push({ tag: 'tuple_lit_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  record: (cmd: { record: any; expr: any; isCheck: boolean }) => {
    const index = cmd.record.value - 1 // input is 1-indexed
    !cmd.isCheck && A.push({ tag: 'record_i', index })

    if (cmd.expr.tag === 'tuple_lit') {
      cmd.expr['isCheck'] = cmd.isCheck
      A.push(cmd.expr)
    }

    if (cmd.expr.type === 'Identifier') {
      A.push({ tag: 'id', sym: cmd.expr.name, isCheck: cmd.isCheck })
    }
  },
  app: (cmd: { args: any[]; fun: any; isCheck: boolean }) => {
    if (!cmd.isCheck) {
      A.push({ tag: 'app_i', arity: cmd.args.length })
    }
    for (let i = 0; i < cmd.args.length; i++) {
      cmd.args[i]['isCheck'] = cmd.isCheck
      A.push(cmd.args[i])
    }
    cmd.fun['isCheck'] = cmd.isCheck
    A.push(cmd.fun)
  },
  cond_expr: (cmd: {
    pred: any
    cons: any
    alt: any
    node: es.ConditionalExpression
    isCheck: boolean
  }) => {
    A.push({ tag: 'branch_i', cons: cmd.cons, alt: cmd.alt, node: cmd.node, isCheck: cmd.isCheck })
    cmd.pred['isCheck'] = cmd.isCheck
    A.push(cmd.pred)
  },
  binop_i: (cmd: { sym: es.BinaryOperator; loc: es.SourceLocation }) => {
    const right = S.pop()
    const left = S.pop()
    const result = binaryOp(cmd.sym, left, right, cmd.loc)
    S.push(rttc.getTypedLiteral(result))
  },
  unop_i: (cmd: { sym: es.UnaryOperator; loc: es.SourceLocation }) => {
    const arg = S.pop()
    const result = unaryOp(cmd.sym, arg, cmd.loc)
    S.push(rttc.getTypedLiteral(result))
  },
  env_i: (cmd: { env: Environment }) => {
    E = cmd.env
  },
  assmt_i: (cmd: { sym: string; frameOffset: number }) => {
    if (cmd.frameOffset && E.tail) {
      return (E.tail.head[cmd.sym] = S.peek())
    }
    E.head[cmd.sym] = S.peek()
  },
  list_lit_i: (cmd: { len: number; node: es.ArrayExpression }) => {
    const list = []
    let type = undefined
    
    for (let i = 0; i < cmd.len; i++) {
      const elem: TypedValue = S.pop()

      if (type == undefined) {
        type = elem
      }

      type = rttc.updateListType(type, elem, cmd.node)

      list.push(elem.value)
    }

    S.push(rttc.getDeclaredTypedList(type, list))
  },
  list_merge_i: (cmd: { node: es.ArrayExpression; loc: es.SourceLocation }) => {
    // const list = []
    // let first = undefined
    // //TODO: check both is list + same type
    // for (let i = 0; i < cmd.len; i++) {
    //   const elem = S.pop()
    //   if (elem.value.length === 0) {
    //     continue
    //   }
    //   if (first === undefined) {
    //     first = elem.value[0]
    //   }
    //   if (!rttc.isTypeEqual(first, elem)) {
    //     throw new rttc.TypeError(cmd.node, ' as list element to merge @', first, elem)
    //   }
    //   list.push(...elem.value)
    // }
    // S.push(rttc.getTypedList(first, list))
  },
  list_append_i: (cmd: { node: es.ArrayExpression; loc: es.SourceLocation }) => {
    const left = S.pop()
    const right = S.pop()
    const result = binaryOp('::', left, right, cmd.loc)
    S.push(rttc.getAppendedTypedList(left, right, result))
  },
  tuple_lit_i: (cmd: { len: number; node: es.ArrayExpression }) => {
    const tuple = []
    const type = []
    for (let i = 0; i < cmd.len; i++) {
      const elem = S.pop()
      tuple.push(elem.value)
      type.push(rttc.getElemType(elem))
    }
    S.push({ type: 'tuple', typeArr: type, value: tuple })
  },
  record_i: (cmd: { index: number }) => {
    const tuple = S.pop()

    if (tuple.type !== 'tuple') {
      throw Error('# can only be used on tuples')
    }

    if (cmd.index < 0 || cmd.index >= tuple.value.length) {
      throw Error('index out of bounds')
    }

    S.push(rttc.getTypedTupleElem(tuple, cmd.index))
  },
  app_i: (cmd: { arity: number }) => {
    const args = []
    for (let i = 0; i < cmd.arity; i++) {
      args.push(S.pop())
    }
    const func = S.pop()

    // TODO: Implement tail call
    A.push({ tag: 'env_i', env: E })

    A.push(func.body)
    // set E to the function env, extended with params and args
    const newFrame = {}
    for (let j = 0; j < cmd.arity; j++) {
      newFrame[func.params[j]] = args[j]
    }
    E = {
      head: newFrame,
      tail: func.env,
      id: E.id,
      name: 'program'
    }
  },
  branch_i: (cmd: { cons: any; alt: any; node: es.ConditionalExpression; isCheck: boolean }) => {
    if (cmd.isCheck) {
      const checkCons = { ...cmd.cons, isCheck: cmd.isCheck }
      const checkAlt = { ...cmd.alt, isCheck: cmd.isCheck }
      A.push(checkCons)
      A.push(checkAlt)
      return
    }

    const pred = S.pop()
    const error = rttc.checkIfStatement(cmd.node, pred)
    if (error) {
      throw error
    }

    A.push(pred.value ? cmd.cons : cmd.alt)
  },
  closure_i: (cmd: { params: any[]; body: any; env: Environment }) => {
    S.push({ tag: 'closure', params: cmd.params, body: cmd.body, env: cmd.env })
  }
}
// tslint:enable:object-literal-shorthand

export function* evaluate(node: es.Node, context: Context): any {
  A = new Stack<any>()
  S = new Stack<Value>()
  E = createGlobalEnvironment()
  console.log('=====START EVALUATION=====')
  A.push(yield* evaluators[node.type](node, context))
  let i = 0
  while (i < step_limit) {
    if (A.size() === 0) break
    const cmd = A.pop()
    console.log('\n=====instruction====')
    console.log(cmd)
    // console.log("\n=====agenda====")
    // A.print()
    if (cmd && microcode.hasOwnProperty(cmd.tag)) {
      console.log('before stash:')
      S.print() // print stash
      microcode[cmd.tag](cmd)
      console.log('after stash:')
      S.print() // print stash
    } else {
      console.log('error')
    }
    i++
  }

  // const result = yield* evaluators[node.type](node, context)
  yield* leave(context)
  console.log('\n=====EXIT EVALUATION=====\n')
  const r = S.pop()
  console.log(r)
  return r.value
}
