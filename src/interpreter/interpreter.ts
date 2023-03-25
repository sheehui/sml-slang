/* tslint:disable:max-classes-per-file */
import * as es from 'estree'

import { createGlobalEnvironment } from '../createContext'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Context, Environment, SmlType, TypedValue, Value } from '../types'
import { Stack } from '../types'
import { binaryOp, unaryOp } from '../utils/operators'
import * as rttc from '../utils/rttc'
import * as stc from './stc'

const step_limit = 10000
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
      val: node.value,
      type: rttc.getTypeFromVal(node.value)
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

    // type check 
    let type = undefined

    if (tag === 'list_lit') {
      for (let i = 0; i < node.elements.length; i++) {
        const elem = yield* evaluators[node.elements[i]!.type](node.elements[i]!, context)
        elems.push(elem)
        if (type == undefined) {
          type = elem.type 
        }
        type = rttc.updateListLitType(type, elem.type, node)
      }
      type = rttc.getListLitType(type) 
    } else if (tag === 'tuple_lit') {
      type = []
      for (let i = 0; i < node.elements.length; i++) {
        const elem = yield* evaluators[node.elements[i]!.type](node.elements[i]!, context)
        elems.push(elem)
        type.push(elem.type)
      }
      type.push('tuple')
    } else {
      const left = yield* evaluators[node.elements[0]!.type](node.elements[0]!, context)
      const right = yield* evaluators[node.elements[1]!.type](node.elements[1]!, context)
      elems.push(left)
      elems.push(right)
      const op = tag === 'list_construct' ? "::" : "@" 
      const error = rttc.checkBinaryExpression(node, op, {type: left.type, value: 0}, {type: right.type, value: 0})
      if (error) {
        throw error 
      }
      type = tag === 'list_construct' 
        ? rttc.getConstructedTypedList(left, right, 0).type 
        : rttc.getAppendedTypedList(left, right, 0).type
    }

    return {
      tag, 
      elems,
      node,
      loc: node.loc,
      type
    }
  },

  FunctionExpression: function* (node: es.FunctionExpression, context: Context) {
    const params = []
    let paramsTypes = [] 
    // extend env here 
    const initEnv = stc.getTypeEnv()
    stc.extendTypeEnv([], []) 
    for (let i = 0; i < node.params.length; i++) {
      stc.addToFrame((node.params[i] as any).name, "'a")
      const param = yield* evaluators[node.params[i].type](node.params[i], context)
      params.push(param)
      paramsTypes.push(param.type)
      stc.addToFrame(param.sym, param.type)
    }
    paramsTypes.push('tuple')
    paramsTypes = paramsTypes.length <= 2 ? paramsTypes[0] : paramsTypes
    console.log("EVAL BODY")
    const body = yield* evaluators[node.body.type](node.body, context) 

    stc.restoreTypeEnv(initEnv)
    return {
      tag: 'lam', 
      params,
      body,
      id: node.id ? yield* evaluators[node.id.type](node.id, context) : node.id,
      type: [paramsTypes, body.type, 'fun'], 
    }
  },

  ArrowFunctionExpression: function* (node: es.ArrowFunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  Identifier: function* (node: es.Identifier, context: Context) {    
    let valType = (node as any).valType 
    console.log(stc.getTypeEnv(), "TYPEENV")
    if (!valType) {
      valType = stc.findTypeInEnv(node.name) 
    } else {
      stc.addToFrame(node.name, valType)
    }
    console.log(valType, node.name)

    return {
      tag: 'id', 
      sym: node.name,
      type: valType // undefined if no type avail 
    }
  },

  CallExpression: function* (node: es.CallExpression, context: Context) {
    const fun = yield* evaluators[node.callee.type](node.callee, context)

    const paramTypes = fun.type[0] 
    let argTypes = []
    const args = [] 
    for (let i = 0; i < node.arguments.length; i++) { 
      const arg = yield* evaluators[node.arguments[i].type](node.arguments[i], context)
      argTypes.push(arg.type)
      args.push(arg)
    }
    argTypes.push('tuple')
    argTypes = argTypes.length <= 2 ? argTypes[0] : argTypes
    // check if arg type = param type 
    if (!rttc.isTypeArrSubset(argTypes, paramTypes)) {
      throw new rttc.TypeError(node, ' as argument to function', rttc.typeToString(paramTypes), rttc.typeToString(argTypes))
    }

    const type = fun.type[1] 
    return {
      tag: 'app', 
      fun, 
      args,
      type
    }
  },

  NewExpression: function* (node: es.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
    const arg = yield* evaluators[node.argument.type](node.argument, context)
    const typeError = rttc.checkUnaryExpression(node, node.operator, {type: arg.type, value: 0})
    if (typeError) {
      throw typeError 
    }
    // get return type of unary expression
    const type = rttc.operatorToResultType(node.operator, arg.type, arg.type)
    return {
      tag: 'unop',
      sym: node.operator, 
      arg,
      loc: node.loc,
      type
    }
  },

  BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
    const frst = yield* evaluators[node.right.type](node.right, context)
    const scnd = yield* evaluators[node.left.type](node.left, context)

    const left = {type: frst.type, value: 0} 
    const right = {type: scnd.type, value: 0}
    // type check
    const typeError = rttc.checkBinaryExpression(node, node.operator, left, right)
    if (typeError) {
      throw typeError
    }
    // push some dummy object containing type onto stack
    const type = rttc.operatorToResultType(node.operator, frst.type, scnd.type)
    console.log(type, "TYPE")
    return {
      tag: 'binop',
      sym: node.operator,
      frst,
      scnd,
      loc: node.loc,
      type
    }
  },

  MemberExpression: function* (node: es.MemberExpression, context: Context) {
    const expr = yield* evaluators[node.object.type](node.object, context)
    const type = expr.type[(node.property as any).value]  
    return {
      tag: 'record',
      record: node.property,
      expr,
      node,
      type
    }
  },

  ConditionalExpression: function* (node: es.ConditionalExpression, context: Context) {
    const pred = yield* evaluators[node.test.type](node.test, context)
    if (!rttc.typeArrEqual(pred.type, 'boolean')) {
      throw new rttc.TypeError(node, " as predicate", 'boolean', pred.type)
    }
    const cons = yield* evaluators[node.consequent.type](node.consequent, context)
    const alt = yield* evaluators[node.alternate.type](node.alternate, context)

    const subsetOfConsAlt = rttc.isTypeArrSubset(cons.type, alt.type)
    const subsetOfAltCons = rttc.isTypeArrSubset(alt.type, cons.type)

    // check if neither types of cons and alt are subsets of the other
    if (!subsetOfConsAlt || !subsetOfAltCons) {
      throw Error(`Match rules disagree on type: Cannot merge '${cons.type}' and '${alt.type}'`)
    }

    return {
      tag: 'cond_expr', 
      pred,
      cons,
      alt,
      node: node,
      type: subsetOfConsAlt ? subsetOfConsAlt : subsetOfAltCons,
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
      // deal with local declarations
      const locals = (decl as any).locals 
      const initEnv = stc.getTypeEnv() 
      if (locals) {
        stc.extendTypeEnv([], [])
        localStartIdx = i
        localDecs = yield* evaluators[locals.decs.type](locals.decs, context)
        localArity = locals.arity
      }

      stc.addToFrame((decl.id as any).name, "'a") // some unassigned type 
      const id = yield* evaluators[decl.id.type](decl.id, context)

      const expr = yield* evaluators[decl.init!.type](decl.init!, context)

      if (locals) {
        stc.restoreTypeEnv(initEnv)
      }

      // check type of id against type of expr
      if (id.type !== "'a") {
        // unify
        if (!rttc.isTypeArrSubset(expr.type, id.type)) {
          throw new rttc.TypeError(
            node,
            ' as assigned value',
            rttc.typeToString(id.type),
            rttc.typeToString(expr.type)
          )
        }
        stc.addToFrame(id.sym, id.type) 
      } else {
        // no type specified for var, use type of expr as type of var 
        stc.addToFrame(id.sym, expr.type)
      }

      ids.push(id)
      exprs.push(expr)
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
    let type = undefined 
    const locals = (node as any).locals
    const initEnv = stc.getTypeEnv()  
    if (locals) {
      stc.extendTypeEnv([], []) 
      const localDecs = yield* evaluators[locals.type](locals, context)
      body.push(localDecs)
    }

    for (let i = 0; i < node.expressions.length; i++) {
      const expr = yield* evaluators[node.expressions[i].type](node.expressions[i], context)
      body.push(expr)
      if (i === node.expressions.length - 1) {
        type = expr.type
      }
    }
    if (locals) {
      // restore env 
      stc.restoreTypeEnv(initEnv)
    }
    
    return locals ? {
      tag: 'blk', 
      body: { 
        tag: 'seq', 
        body,
        type
      },
      type
    } : {
      tag: 'seq',
      body,
      type 
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
    let type = undefined
    for (let i = 0; i < node.body.length; i++) {
      const expr = node.body[i]
      const stmt = yield* evaluators[expr.type](expr, context)
      stmts.push(stmt)
      if (i === node.body.length - 1) {
        type = stmt.type 
      }
    }
    const jsonBody = node.body.length > 1 ? {
      tag: 'seq',
      body: stmts
    } : stmts[0]
    
    return {
      tag: 'blk',
      body: jsonBody,
      type
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
    // body['isCheck'] = cmd.isCheck
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
      // expr['isCheck'] = cmd.isCheck
      A.push(expr)
      if (i === 0) {
        continue
      }
      A.push({ tag: 'pop_i' })
    }
  },
  lit: (cmd: { val: any; isCheck: boolean }) => {
    S.push(rttc.getTypedLiteral(cmd.val))
  },
  id: (cmd: { sym: string; isCheck: boolean }) => {
    let env: Environment | null = E
    while (env) {
      const frame = env.head
      if (frame.hasOwnProperty(cmd.sym)) {
        return S.push(frame[cmd.sym])
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
    // isCheck: boolean
  }) => {
    A.push({
      tag: 'binop_i',
      sym: cmd.sym,
      loc: cmd.loc
    })
    // cmd.frst['isCheck'] = cmd.isCheck
    // cmd.scnd['isCheck'] = cmd.isCheck
    A.push(cmd.frst)
    A.push(cmd.scnd)
  },
  unop: (cmd: { sym: es.BinaryOperator; arg: any; loc: es.SourceLocation; isCheck: boolean }) => {
    A.push({
      tag: 'unop_i',
      sym: cmd.sym,
      loc: cmd.loc
    })
    // cmd.arg['isCheck'] = cmd.isCheck
    A.push(cmd.arg)
  },
  var: (cmd: {
    ids: any[]
    exprs: any[]
    localStartIdx: number
    localArity: number
    localDecs: any
    // isCheck: boolean
  }) => {
    for (let i = cmd.exprs.length - 1; i >= 0; i--) {
      if (cmd.localStartIdx !== null && i === cmd.localStartIdx + cmd.localArity - 1) {
        // restores the original env after 'local...in...end' is evaluated
        A.push({ tag: 'env_i', env: E })
      }

      A.push({
        tag: 'assmt',
        id: cmd.ids[i],
        expr: cmd.exprs[i],
        // frameOffset to skip the temp frame (if declaration is within 'local...in<HERE>end')
        frameOffset: i >= cmd.localStartIdx && i < cmd.localStartIdx + cmd.localArity ? 1 : 0,
        // isCheck: cmd.isCheck
      })

      if (i !== 0) {
        A.push({ tag: 'pop_i' })
      }

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
  assmt: (cmd: { id: any; expr: any; frameOffset: number; isCheck: boolean }) => {
    A.push({ tag: 'assmt_i', id: cmd.id, frameOffset: cmd.frameOffset })
    // cmd.expr['isCheck'] = cmd.isCheck
    A.push(cmd.expr)
  },
  lam: (cmd: { params: any[]; body: es.BlockStatement; id: any }) => {
    A.push({ tag: 'closure_i', params: cmd.params, body: cmd.body, env: E })

    // check vars + types within function
    // if (A.size() > 0) {
    //   A.push({ tag: 'env_i', env: E })
    // }

    // const body = { ...cmd.body, isCheck: true }
    // A.push(cmd.body)

    // extend environment by 1 frame for block
    // const head = {}
    // cmd.params.forEach(param => (head[param.sym] = { type: param.type, value: null }))
    // if (cmd.id) {
    //   // allows recursive functions (for 'fun' declarations only)
    //   head[cmd.id.sym] = { type: cmd.id.type, value: null }
    // }
    // E = {
    //   head,
    //   tail: E,
    //   id: E.id,
    //   name: 'program'
    // }
  },
  list_lit: (cmd: { elems: any[]; isCheck: boolean; node: es.ArrayExpression }) => {
    A.push({ tag: 'list_lit_i', len: cmd.elems.length, node: cmd.node })
    cmd.elems.forEach(x => {
      // x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  list_append: (cmd: {
    elems: any[]
    isCheck: boolean
    node: es.ArrayExpression
    loc: es.SourceLocation
  }) => {
    A.push({ tag: 'list_append_i', len: cmd.elems.length, loc: cmd.loc })
    cmd.elems.forEach(x => {
      // x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  list_construct: (cmd: {
    elems: any[]
    isCheck: boolean
    node: es.ArrayExpression
    loc: es.SourceLocation
  }) => {
    A.push({ tag: 'list_construct_i', loc: cmd.loc })
    cmd.elems.forEach(x => {
      // x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  tuple_lit: (cmd: { elems: any[]; isCheck: boolean; node: es.ArrayExpression }) => {
    A.push({ tag: 'tuple_lit_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      // x['isCheck'] = cmd.isCheck
      A.push(x)
    })
  },
  record: (cmd: { record: any; expr: any; node: es.MemberExpression; isCheck: boolean }) => {
    const index = cmd.record.value - 1 // input is 1-indexed
    A.push({ tag: 'record_i', index, node: cmd.node })

    if (cmd.expr.type === 'Identifier') {
      A.push({ tag: 'id', sym: cmd.expr.name, isCheck: cmd.isCheck })
    } else {
      // cmd.expr['isCheck'] = cmd.isCheck
      A.push(cmd.expr)
    }
  },
  app: (cmd: { args: any[]; fun: any; isCheck: boolean }) => {
    A.push({ tag: 'app_i', arity: cmd.args.length, isCheck: cmd.isCheck })
    for (let i = 0; i < cmd.args.length; i++) {
      // cmd.args[i]['isCheck'] = cmd.isCheck
      A.push(cmd.args[i])
    }
    // cmd.fun['isCheck'] = cmd.isCheck
    A.push(cmd.fun)
  },
  cond_expr: (cmd: {
    pred: any
    cons: any
    alt: any
    node: es.ConditionalExpression
    isCheck: boolean
  }) => {
    // if (!cmd.isCheck) {
      // actually evaluate the cons and alt in 'branch_i' 
      A.push({ tag: 'branch_i', cons: cmd.cons, alt: cmd.alt, node: cmd.node, isCheck: cmd.isCheck })
      // cmd.pred['isCheck'] = cmd.isCheck 
      A.push(cmd.pred)
    // }

    // type check, 'branch_check_i' does not eval cons and alt
    // A.push({ tag: 'branch_check_i', cons: cmd.cons, alt: cmd.alt, node: cmd.node })
    // A.push({...cmd.cons, isCheck: true })
    // A.push({...cmd.alt, isCheck: true })
    
    // A.push({...cmd.pred, isCheck: true})
    
    
  },
  binop_i: (cmd: { sym: es.BinaryOperator; loc: es.SourceLocation }) => {
    const right = S.pop()
    const left = S.pop()
    const result = binaryOp(cmd.sym, left, right, cmd.loc)
    S.push(rttc.getTypedLiteral(result))
  },
  binop_check_i: (cmd: { sym: es.BinaryOperator; loc: es.SourceLocation }) => {
    const right = S.pop()
    const left = S.pop()
    // check if types match operator
    const dummyNode: es.Node = { type: 'Literal', value: null }
    const typeError = rttc.checkBinaryExpression(dummyNode, cmd.sym, left, right)
    if (typeError) {
      throw typeError
    }
    // push some dummy object containing type onto stack
    S.push({ type: rttc.operatorToResultType(cmd.sym, left.type, right.type), value: null })
  },
  unop_i: (cmd: { sym: es.UnaryOperator; loc: es.SourceLocation }) => {
    const arg = S.pop()
    const result = unaryOp(cmd.sym, arg, cmd.loc)
    S.push(rttc.getTypedLiteral(result))
  },
  unop_check_i: (cmd: { sym: es.UnaryOperator; loc: es.SourceLocation }) => {
    const arg = S.pop()
    // check if type match operator
    const dummyNode: es.Node = { type: 'Literal', value: null }
    const typeError = rttc.checkUnaryExpression(dummyNode, cmd.sym, arg)
    if (typeError) {
      throw typeError
    }
    // push some dummy object containing type onto stack
    S.push({ type: rttc.operatorToResultType(cmd.sym, arg.type, arg.type), value: null })
  },
  env_i: (cmd: { env: Environment }) => {
    E = cmd.env
  },
  assmt_i: (cmd: { id: any; frameOffset: number }) => {
    const val = S.peek() 
    const valType = val.type
    const idType = cmd.id.type 
    // if (idType && !rttc.isTypeArrSubset(valType, idType)) {
    //   // used dummy node for now, lazy pass node
    //   const dummyNode: es.Node = { type: 'Literal', value: null }
    //   throw new rttc.TypeError(
    //     dummyNode,
    //     ' as assigned value',
    //     rttc.typeToString(idType),
    //     rttc.typeToString(valType)
    //   )
    // }
    if (cmd.frameOffset && E.tail) {
      return (E.tail.head[cmd.id.sym] = val)
    }
    E.head[cmd.id.sym] = val
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
  list_append_i: (cmd: { node: es.ArrayExpression; loc: es.SourceLocation }) => {
    const left = S.pop()
    const right = S.pop()
    const result = binaryOp('@', left, right, cmd.loc)
    S.push(rttc.getAppendedTypedList(left, right, result))
  },
  list_construct_i: (cmd: { node: es.ArrayExpression; loc: es.SourceLocation }) => {
    const left = S.pop()
    const right = S.pop()
    const result = binaryOp('::', left, right, cmd.loc)
    S.push(rttc.getConstructedTypedList(left, right, result))
  },
  tuple_lit_i: (cmd: { len: number; node: es.ArrayExpression }) => {
    const tuple = []
    const type = []
    for (let i = 0; i < cmd.len; i++) {
      const elem = S.pop()
      tuple.push(elem.value)
      type.push(rttc.getElemType(elem))
    }
    type.push('tuple')
    S.push({ type: type, value: tuple })
  },
  record_i: (cmd: { index: number; node: es.MemberExpression }) => {
    const tuple = S.pop()
    S.push(rttc.getTypedTupleElem(cmd.node, tuple, cmd.index))
  },
  app_i: (cmd: { arity: number; isCheck: boolean }) => {
    const args = []
    for (let i = 0; i < cmd.arity; i++) {
      args.push(S.pop())
    }
    let func = S.pop()

    // check if func params type match
    // const paramsTypes = func.type[0]
    // const argsTypes = args.length > 1
    //   ? args.reduce((x, y) => {
    //       x.push(y.type)
    //       return x
    //     }, [])
    //   : args[0].type
    // if (args.length > 1) {
    //   argsTypes.push('tuple')
    // }
    // if (!rttc.isTypeArrSubset(argsTypes, paramsTypes as SmlType)) {
    //   const dummyNode: es.Node = { type: 'Literal', value: null }
    //   throw new rttc.TypeError(dummyNode, ' as argument to function', rttc.typeToString(paramsTypes), rttc.typeToString(argsTypes))
    // }

    // if (cmd.isCheck) {
    //   // no need to evaluate body, just push the return type 
    //   return S.push({ type: func.type[1], value: null })
    // }

    // func = func.value

    // TODO: Implement tail call
    A.push({ tag: 'env_i', env: E })

    A.push(func.body)
    // set E to the function env, extended with params and args
    const newFrame = {}
    for (let j = 0; j < cmd.arity; j++) {
      newFrame[func.params[j].sym] = args[j]
    }
    console.log(newFrame, "NEWFRAME")
    E = {
      head: newFrame,
      tail: func.env,
      id: E.id,
      name: 'program'
    }
  },
  branch_i: (cmd: { cons: any; alt: any; node: es.ConditionalExpression; isCheck: boolean }) => {
    const pred = S.pop() 
    A.push(pred.value ? cmd.cons : cmd.alt)
  },
  branch_check_i: (cmd: { cons: any; alt: any; node: es.ConditionalExpression }) => {
    const consVal = S.pop()
    const altVal = S.pop()

    const subsetOfConsAlt = rttc.isTypeArrSubset(consVal.type, altVal.type)
    const subsetOfAltCons = rttc.isTypeArrSubset(altVal.type, consVal.type)

    // check if neither types of cons and alt are subsets of the other
    if (!subsetOfConsAlt || !subsetOfAltCons) {
      throw Error(`Match rules disagree on type: Cannot merge '${consVal.type}' and '${altVal.type}'`)
    }

    const pred = S.pop()
    if (!rttc.typeArrEqual(pred.type, 'boolean')) {
      throw new rttc.TypeError(cmd.node, " as predicate", 'boolean', pred.type)
    }
     
    // push type of conditional expr onto stack (take the most constraining type)
    S.push({ 
      type: subsetOfConsAlt ? subsetOfConsAlt : subsetOfAltCons,
      value: null 
    })
  },
  closure_i: (cmd: { params: any[]; body: any; env: Environment }) => {
    // for now, parameter types are all given
    // extract types from list of param objects
    // const paramsTypes = cmd.params.length > 1
    //   ? cmd.params.reduce((x, y) => {
    //     x.push(y.type)
    //     return x 
    //   }, [])
    //   : cmd.params[0].type
    // if (cmd.params.length > 1) {
    //   paramsTypes.push('tuple')
    // }
    // const retType = S.pop().type // type of function body is on the stash after checks

    // S.push({
    //   type: [paramsTypes, retType, 'fun'],
    //   value: {
    //     tag: 'closure',
    //     params: cmd.params.map(param => param.sym),
    //     body: cmd.body,
    //     env: cmd.env
    //   }
    // })
    S.push({ tag: 'closure', params: cmd.params, body: cmd.body, env: cmd.env })
  },
  pop_i: () => {
    S.pop()
  }
}
// tslint:enable:object-literal-shorthand

export function* evaluate(node: es.Node, context: Context): any {
  A = new Stack<any>()
  S = new Stack<Value>()
  E = createGlobalEnvironment()
  stc.resetTypeEnv()
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
      // console.log('before stash:')
      // S.print() // print stash
      microcode[cmd.tag](cmd)
      // console.log('after stash:')
      // S.print() // print stash
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
