/* tslint:disable:max-classes-per-file */
import * as es from 'estree'

import { createGlobalEnvironment } from '../createContext'
import {
  PatternLenMatchError,
  PatternMatchError,
  PredicateTypeError
} from '../errors/compileTimeSourceError'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Context, Environment, SmlType, TypedValue, Value } from '../types'
import { Stack } from '../types'
import * as cttc from '../utils/cttc'
import { binaryOp, unaryOp } from '../utils/operators'

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
      val: node.value === null ? [] : node.value,
      type: cttc.getTypeFromVal(node.value)
    }
  },

  ArrayExpression: function* (node: es.ArrayExpression, context: Context) {
    const elems = []
    const tag = node.leadingComments![0].value

    // type check 
    let type = undefined

    if (tag === 'list_lit') {
      for (let i = node.elements.length - 1; i >= 0; i--) { // right assoc
        const elem = yield* evaluators[node.elements[i]!.type](node.elements[i]!, context)
        elems.push(elem)
        if (!type) {
          type = elem.type 
        }
        type = cttc.unifyListLitType(type, elem.type)
      }
      type = cttc.getDeclaredListType(type)
      elems.reverse()
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
      type = cttc.typeSchemeCheck(op, [left.type, right.type], undefined)?.return
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
    if (node.id) {
      // recursive, so add the variable into type scheme env 
      cttc.addToSchemeFrame(node.id.name, cttc.newSchemeVar())
      // then eval identifier to get type annotations if any 
      yield* evaluators[node.id.type](node.id, context)
    }
    const params = []
    let paramsTypes : SmlType = [] 

    // extend env here to eval func block
    const initEnv = cttc.getTypeEnv()
    const initSchemeEnv = cttc.getSchemeEnv() 
    cttc.extendTypeEnv([], []) 
    cttc.extendSchemeEnv([], [])

    for (let i = 0; i < node.params.length; i++) {
      // add some unassigned type to type env (normal var by default)
      // if it end up being a function type we handle it in the CallExpression
      cttc.addToTypeFrame((node.params[i] as any).name, cttc.newTypeVar()) 

      const param = yield* evaluators[node.params[i].type](node.params[i], context)
      params.push(param)
    }

    const body = yield* evaluators[node.body.type](node.body, context) 

    // convert params to a SmlType 
    for (let i = 0; i < params.length; i++) {
      paramsTypes.push(cttc.findTypeInEnv(params[i].sym))
      if (i === params.length - 1 && i > 0) {
        paramsTypes.push('tuple')
      }
    }
    paramsTypes = paramsTypes.length === 1 
      ? paramsTypes[0]
      : paramsTypes

    // finish eval func block so restore the env
    cttc.restoreTypeEnv(initEnv)
    cttc.restoreSchemeEnv(initSchemeEnv)

    // check if free type var occurs in environment (para polymorphism)
    // if it doesnt, generalise to 'a 
    function generalise(type: SmlType) : SmlType {
      if (!Array.isArray(type)) {
        // search env for type 
        if (cttc.isTypeVar(type) && !cttc.isTypeVarInEnv(type)) { // generalise 
          cttc.forAllSet.add(type) 
          return type
        }
      } else {
        return type.map(x => generalise(x))
      }
      return type 
    }
    const type = generalise([paramsTypes, body.type, 'fun'])
    return {
      tag: 'lam', 
      params,
      body,
      id: node.id ? yield* evaluators[node.id.type](node.id, context) : node.id,
      type, 
    }
  },

  Identifier: function* (node: es.Identifier, context: Context) {    
    let valType = (node as any).valType
    if (node.name === '_') {
      return {
        tag: 'id', 
        sym: node.name,
        type: valType ? valType : cttc.newTypeVar() 
      }
    }
    if (!valType) {
      valType = cttc.isInTypeEnv(node.name) 
        ? cttc.findTypeInEnv(node.name) 
        : cttc.findSchemeInEnv(node.name)
    } else {
      valType = cttc.addToTypeFrame(node.name, valType)
    }


    // convert from scheme to smltype 
    valType = cttc.schemeToSmlType(valType)

    return {
      tag: 'id', 
      sym: node.name,
      type: valType
    }
  },

  CallExpression: function* (node: es.CallExpression, context: Context) {
    if (node.callee.type === 'Identifier') {
      // param types are Tn by default, so replace with Tn -> Tn1 if needed
      cttc.modifyTypeScheme(node.callee.name, cttc.newSchemeVar()) 
    }
    const fun = yield* evaluators[node.callee.type](node.callee, context)
    const paramTypes = fun.type[0] // fun.type is a SmlType 

    let argTypes = []
    const args = [] 
    for (let i = 0; i < node.arguments.length; i++) { 
      const arg = yield* evaluators[node.arguments[i].type](node.arguments[i], context)
      argTypes.push(arg.type)
      args.push(arg)
    }

    // convert argTypes to a SmlType 
    argTypes.push('tuple')
    argTypes = argTypes.length <= 2 ? argTypes[0] : argTypes

    const [unifyArgType, sub] = cttc.unifyReturnType(paramTypes, argTypes)
    cttc.applySub(fun, sub)

    const type = fun.type[1] // take the return type of fun as the call type
    return {
      tag: 'app', 
      fun, 
      args,
      type
    }
  },

  UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
    const arg = yield* evaluators[node.argument.type](node.argument, context)    
    const type = cttc.typeSchemeCheck(node.operator, [arg], undefined)
    const [isEval, res] = cttc.partialEvaluate([arg], node.operator, 'unop')

    return isEval ? {
      tag: 'lit',
      val: res,
      type: type?.return
    }:{
      tag: 'unop',
      sym: node.operator, 
      arg,
      loc: node.loc,
      type: type?.return
    }
  },

  BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
    const scnd = yield* evaluators[node.right.type](node.right, context)
    const frst = yield* evaluators[node.left.type](node.left, context)
    const type = cttc.typeSchemeCheck(node.operator, [frst, scnd], undefined)
    const [isEval, res] = cttc.partialEvaluate([frst, scnd], node.operator, 'binop')

    return isEval ? {
      tag: 'lit',
      val: res,
      type: type?.return
    } : {
      tag: 'binop',
      sym: node.operator,
      frst,
      scnd,
      loc: node.loc,
      type: type?.return
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
    if (pred.type !== 'bool') {
      throw new PredicateTypeError(pred.type)
    }
    const cons = yield* evaluators[node.consequent.type](node.consequent, context)
    const alt = yield* evaluators[node.alternate.type](node.alternate, context)
    const type = cttc.unifyBranches(cons.type, alt.type)[0]
    const [isEval, res] = cttc.partialEvaluate([cons, alt], pred, 'cond')

    return isEval 
    ? res 
    : {
      tag: 'cond_expr', 
      pred,
      cons,
      alt,
      node: node,
      type
    }
  },

  VariableDeclaration: function* (node: es.VariableDeclaration, context: Context) {
    function initIdType(exprType: SmlType, id: string) {
      cttc.isTypedFun(exprType) 
        ? cttc.addToSchemeFrame(id, cttc.newSchemeVar()) 
        : cttc.addToTypeFrame(id, cttc.newTypeVar()) 
    }

    const ids = [] 
    const exprs = []
    let localStartIdx = null 
    let localDecs = null 
    let localArity = null 

    for (let i = 0; i < node.declarations.length; i++) {
      const decl = node.declarations[i]
      // deal with local declarations
      const locals = (decl as any).locals 
      
      if (locals) {
        const initEnv = cttc.getTypeEnv()
        const initSchemeEnv = cttc.getSchemeEnv()
        cttc.extendTypeEnv([], [])
        cttc.extendSchemeEnv([], [])
        localStartIdx = i
        localDecs = yield* evaluators[locals.decs.type](locals.decs, context)
        localArity = locals.arity

        const end = i + localArity 
        while (i < end) {
          const decl = node.declarations[i]
          const expr = yield* evaluators[decl.init!.type](decl.init!, context)
          if (decl.id.type === "ArrayPattern" && cttc.isTypedTuple(expr.type)) {
            if (decl.id.elements.length !== expr.type.length - 1) {
              throw new PatternLenMatchError(decl.id.elements.length, expr.type.length - 1)
            }
            const idTupElems = []
            for (let i = 0; i < decl.id.elements.length; i++) {
              const currExprType = expr.type[i]
              const elem = decl.id.elements[i]
              if (!elem) break 
              const sym = (elem as any).name
              sym !== "_" && initIdType(currExprType, sym)

              const id = yield* evaluators[elem.type](elem, context)
              const type = cttc.unifyReturnType(id.type, currExprType)[0]
              sym !== "_" && cttc.addToTypeFrame(id.sym, type, 1)
              idTupElems.push(id) 
            }
            ids.push(idTupElems)
          } else if (decl.id.type === "Identifier") {
            initIdType(expr.type, (decl.id as any).name)
            const id = yield* evaluators[decl.id.type](decl.id, context)
            const type = cttc.unifyReturnType(id.type, expr.type)[0]
            cttc.addToTypeFrame(id.sym, type, 1) 
            
            ids.push(id)
          } else {
            throw new PatternMatchError(expr.type)
          }
          exprs.push(expr)
          i++  
        }
        cttc.restoreTypeEnv(initEnv)
        cttc.restoreSchemeEnv(initSchemeEnv)
        i-- 
        continue 
      }

      const expr = yield* evaluators[decl.init!.type](decl.init!, context)
      if (decl.id.type === "ArrayPattern" && cttc.isTypedTuple(expr.type)) {
        if (decl.id.elements.length !== expr.type.length - 1) {
          throw new PatternLenMatchError(decl.id.elements.length, expr.type.length - 1)
        }
        const idTupElems = []
        for (let i = 0; i < decl.id.elements.length; i++) {
          const currExprType = expr.type[i]
          const elem = decl.id.elements[i]
          if (!elem) break 
          const sym = (elem as any).name
          sym !== "_" && initIdType(currExprType, sym)

          const id = yield* evaluators[elem.type](elem, context)
          const type = cttc.unifyReturnType(id.type, currExprType)[0]
          sym !== "_" && cttc.addToTypeFrame(id.sym, type)
          idTupElems.push(id) 
        }
        ids.push(idTupElems)
      } else if (decl.id.type === "Identifier") {
        initIdType(expr.type, (decl.id as any).name)
        const id = yield* evaluators[decl.id.type](decl.id, context)
        const type = cttc.unifyReturnType(id.type, expr.type)[0]
        cttc.addToTypeFrame(id.sym, type) 
        
        ids.push(id)
      } else {
        throw new PatternMatchError(expr.type)
      }
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

  ExpressionStatement: function* (node: es.ExpressionStatement, context: Context) {
    return yield* evaluators[node.expression.type](node.expression, context)
  },

  SequenceExpression: function* (node: es.SequenceExpression, context: Context) {
    const body = []
    let type = undefined 
    const locals = (node as any).locals
    const initEnv = cttc.getTypeEnv()
    const initSchemeEnv = cttc.getSchemeEnv()  
    if (locals) {
      cttc.extendTypeEnv([], []) 
      cttc.extendSchemeEnv([], [])
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
      cttc.restoreTypeEnv(initEnv)
      cttc.restoreSchemeEnv(initSchemeEnv) 
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
    const progBlk = node.body[0] as es.BlockStatement
    if (progBlk.body.length !== 0) {
      return yield* evaluators[progBlk.type](progBlk, context); 
    }
  }
}

const microcode: { [tag: string]: Function } = {
  blk: (cmd: { body: any }) => {
    if (A.size() > 0) {
      A.push({ tag: 'env_i', env: E })
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
      if (i === 0) {
        continue
      }
      A.push({ tag: 'pop_i' })
    }
  },
  lit: (cmd: { val: any; type: SmlType }) => {
    S.push({ type: cmd.type, value: cmd.val })
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
    throw Error(`Unbound variable ${cmd.sym}`)
  },
  binop: (cmd: { sym: es.BinaryOperator; scnd: any; frst: any; type: SmlType }) => {
    A.push({
      tag: 'binop_i',
      sym: cmd.sym,
      type: cmd.type
    })
    A.push(cmd.scnd)
    A.push(cmd.frst)
  },
  unop: (cmd: { sym: es.BinaryOperator; arg: any; type: SmlType }) => {
    A.push({
      tag: 'unop_i',
      sym: cmd.sym,
      type: cmd.type
    })
    A.push(cmd.arg)
  },
  var: (cmd: {
    ids: any[]
    exprs: any[]
    localStartIdx: number
    localArity: number
    localDecs: any
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
        frameOffset: i >= cmd.localStartIdx && i < cmd.localStartIdx + cmd.localArity ? 1 : 0
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
  assmt: (cmd: { id: any; expr: any; frameOffset: number }) => {
    A.push({ tag: 'assmt_i', id: cmd.id, frameOffset: cmd.frameOffset })
    A.push(cmd.expr)
  },
  lam: (cmd: { params: any[]; body: es.BlockStatement; id: any; type: SmlType }) => {
    A.push({ tag: 'closure_i', params: cmd.params, body: cmd.body, env: E, type: cmd.type })
  },
  list_lit: (cmd: { elems: any[]; node: es.ArrayExpression; type: SmlType }) => {
    A.push({ tag: 'list_lit_i', len: cmd.elems.length, node: cmd.node, type: cmd.type })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  list_append: (cmd: { elems: any[]; node: es.ArrayExpression; type: SmlType }) => {
    A.push({ tag: 'list_append_i', type: cmd.type })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  list_construct: (cmd: { elems: any[]; node: es.ArrayExpression; type: SmlType }) => {
    A.push({ tag: 'list_construct_i', type: cmd.type })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  tuple_lit: (cmd: { elems: any[]; node: es.ArrayExpression }) => {
    A.push({ tag: 'tuple_lit_i', len: cmd.elems.length })
    cmd.elems.forEach(x => {
      A.push(x)
    })
  },
  record: (cmd: { record: any; expr: any; node: es.MemberExpression }) => {
    const index = cmd.record.value - 1 // input is 1-indexed
    A.push({ tag: 'record_i', index, node: cmd.node })

    if (cmd.expr.type === 'Identifier') {
      A.push({ tag: 'id', sym: cmd.expr.name })
    } else {
      A.push(cmd.expr)
    }
  },
  app: (cmd: { args: any[]; fun: any }) => {
    A.push({ tag: 'app_i', arity: cmd.args.length })
    for (let i = 0; i < cmd.args.length; i++) {
      A.push(cmd.args[i])
    }
    A.push(cmd.fun)
  },
  cond_expr: (cmd: { pred: any; cons: any; alt: any; node: es.ConditionalExpression }) => {
    A.push({ tag: 'branch_i', cons: cmd.cons, alt: cmd.alt, node: cmd.node })
    A.push(cmd.pred)
  },
  binop_i: (cmd: { sym: es.BinaryOperator; type: SmlType }) => {
    const right = S.pop()
    const left = S.pop()
    const value = binaryOp(cmd.sym, left, right)
    S.push({ type: cmd.type, value })
  },
  unop_i: (cmd: { sym: es.UnaryOperator; type: SmlType }) => {
    const arg = S.pop()
    const value = unaryOp(cmd.sym, arg)
    S.push({ type: cmd.type, value })
  },
  env_i: (cmd: { env: Environment }) => {
    E = cmd.env
  },
  assmt_i: (cmd: { id: any; frameOffset: number }) => {
    const val = S.peek()
    if (Array.isArray(cmd.id)) {
      S.pop()
      const patt = []
      for (let i = 0; i < val.value.length; i++) {
        const curr = cmd.id[i]
        if (curr.sym === '_') continue
        if (cmd.frameOffset && E.tail) {
          E.tail.head[curr.sym] = val.value[i]
          continue
        }
        E.head[curr.sym] = { value: val.value[i], type: val.type[i] }
        patt.push({ value: val.value[i], type: val.type[i] })
      }
      S.push(patt)
    } else {
      if (cmd.frameOffset && E.tail) {
        return (E.tail.head[cmd.id.sym] = val)
      }
      if (cmd.id.sym === '_') {
        S.pop()
        S.push([])
      } else {
        E.head[cmd.id.sym] = val
      }
    }
  },
  list_lit_i: (cmd: { len: number; node: es.ArrayExpression; type: SmlType }) => {
    const list = []
    for (let i = 0; i < cmd.len; i++) {
      const elem: TypedValue = S.pop()
      list.push(elem.value)
    }

    S.push({ type: cmd.type, value: list })
  },
  list_append_i: (cmd: { node: es.ArrayExpression; type: SmlType }) => {
    const left = S.pop()
    const right = S.pop()
    const value = binaryOp('@', left, right)
    S.push({ type: cmd.type, value })
  },
  list_construct_i: (cmd: { node: es.ArrayExpression; type: SmlType }) => {
    const left = S.pop()
    const right = S.pop()
    const value = binaryOp('::', left, right)
    S.push({ type: cmd.type, value })
  },
  tuple_lit_i: (cmd: { len: number; node: es.ArrayExpression }) => {
    const tuple = []
    const type = []
    for (let i = 0; i < cmd.len; i++) {
      const elem = S.pop()
      tuple.push(elem.value)
      type.push(elem.type)
    }
    type.push('tuple')
    S.push({ type: type, value: tuple })
  },
  record_i: (cmd: { index: number; node: es.MemberExpression }) => {
    const tuple = S.pop()
    S.push({ type: tuple.type[cmd.index], value: tuple.value[cmd.index] })
  },
  app_i: (cmd: { arity: number; isCheck: boolean }) => {
    const args = []
    for (let i = 0; i < cmd.arity; i++) {
      args.push(S.pop())
    }
    const func = S.pop().value

    // tail call
    if (A.size() !== 0 && A.peek().tag !== 'env_i') {
      A.push({ tag: 'env_i', env: E })
    }

    A.push(func.body)
    // set E to the function env, extended with params and args
    const newFrame = {}
    for (let j = 0; j < cmd.arity; j++) {
      newFrame[func.params[j].sym] = args[j]
    }
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
  closure_i: (cmd: { params: any[]; body: any; env: Environment; type: SmlType }) => {
    const value = {
      tag: 'closure',
      params: cmd.params,
      body: cmd.body,
      env: cmd.env,
      type: cmd.type
    }
    S.push({ type: cmd.type, value })
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
  cttc.resetTypeEnv()
  cttc.resetSchemeEnv()
  // console.log('=====START EVALUATION=====')
  A.push(yield* evaluators[node.type](node, context))
  let i = 0
  while (i < step_limit) {
    if (A.size() === 0) break
    const cmd = A.pop()
    // console.log('\n=====instruction====')
    // console.log(cmd)
    // console.log("\n=====agenda====")
    // A.print()
    if (cmd && microcode.hasOwnProperty(cmd.tag)) {
      // console.log('before stash:')
      // S.print() // print stash
      microcode[cmd.tag](cmd)
      // console.log('after stash:')
      // S.print() // print stash
    } else {
      // throw Error('Bad command')
    }
    i++
  }

  // const result = yield* evaluators[node.type](node, context)
  yield* leave(context)
  // console.log('\n=====EXIT EVALUATION=====\n')
  const r = S.pop()
  // console.log(r)
  // console.log(cttc.getTypeEnv().head)
  // console.log(cttc.getSchemeEnv().head)
  return r
}
