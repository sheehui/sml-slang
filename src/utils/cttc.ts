import * as es from 'estree'

import {
  FunctionTypeError,
  MatchTypeError,
  ReturnTypeError
} from '../errors/compileTimeSourceError'
import { FreeType, SmlType, Value } from '../types'
import { binaryOp, unaryOp } from './operators'

let typeEnv: TypeEnv = {
  head: {},
  tail: null,
  index: 0
}

const PRIM_TYPE_SCHEME: TypeSchemeFrame = {
  '~': { args: ['int'], return: 'int' },
  '!': { args: ['bool'], return: 'bool' },
  '+': { args: ['int', 'int'], return: 'int' },
  '-': { args: ['int', 'int'], return: 'int' },
  '/': { args: ['int', 'int'], return: 'int' },
  '*': { args: ['int', 'int'], return: 'int' },
  '%': { args: ['int', 'int'], return: 'int' },
  '^': { args: ['string', 'string'], return: 'string' },
  '!==': { args: ["'a", "'a"], return: 'bool' },
  '===': { args: ["'a", "'a"], return: 'bool' },
  '>': [
    { args: ['int', 'int'], return: 'bool' },
    { args: ['string', 'string'], return: 'bool' }
  ],
  '>=': [
    { args: ['int', 'int'], return: 'bool' },
    { args: ['string', 'string'], return: 'bool' }
  ],
  '<': [
    { args: ['int', 'int'], return: 'bool' },
    { args: ['string', 'string'], return: 'bool' }
  ],
  '<=': [
    { args: ['int', 'int'], return: 'bool' },
    { args: ['string', 'string'], return: 'bool' }
  ]
}

const LIST_SCHEME: FunctionType = {
  args: ["'a", ["'a", 'list']],
  return: ["'a", 'list']
}

let typeSchemeEnv: TypeSchemeEnv = {
  head: PRIM_TYPE_SCHEME,
  tail: null
}

const isNumber = (v: Value) => typeOf(v) === 'number'
const isString = (v: Value) => typeOf(v) === 'string'
const isBool = (v: Value) => typeOf(v) === 'boolean'
const isNil = (v: Value) => typeOf(v) === 'null'

const isFreeLiteral = (v: SmlType) => v === "'a"
const isTypedList = (v: SmlType) => Array.isArray(v) && v[v.length - 1] === 'list'
const isFreeList = (v: SmlType) => isTypedList(v) && v[0] === "'a"
export const isTypedTuple = (v: SmlType) => Array.isArray(v) && v[v.length - 1] === 'tuple'
export const isTypedFun = (v: SmlType) => Array.isArray(v) && v[v.length - 1] === 'fun'
const isListOrTuple = (v: SmlType) => isTypedList(v) || isTypedTuple(v)
const isTypeVar = (v: SmlType) => typeOf(v) === 'string' && v[0] === 'T'
export const isFuncType = (v: any) => v.args && v.return

export const smlToFuncType = (v: SmlType): FunctionType => {
  v = v as Array<SmlType> // we are sure that v is an array
  const smlParams = v[0]
  const smlRet: SmlType = v[1]
  let args = isTypedTuple(smlParams) ? smlParams.slice(0, -1) : [smlParams]
  args = (args as Array<SmlType>).map(x => (x === undefined ? newTypeVar() : x))
  const newRet = {
    args,
    return: smlRet !== undefined ? smlRet : newTypeVar()
  }
  return newRet
}

const typeOf = (v: Value) => {
  if (v === null) {
    return 'null'
  } else if (v === undefined) {
    return 'undefined'
  } else {
    return typeof v
  }
}

const isStrictEqual = (left: SmlType, right: SmlType): boolean => {
  return left.toString() === right.toString()
}

const getListDepth = (v: SmlType) => {
  if (isTypedList(v)) {
    let depth = 0
    for (let i = (v as Array<SmlType>).length - 1; i >= 0; i--) {
      if (v[i] === 'list') {
        depth++
      } else {
        break
      }
    }
    return depth
  }
  throw Error('cannot get list depth of non-list type')
}

export const getTypeFromVal = (val: any): SmlType => {
  if (isBool(val)) {
    return 'bool'
  } else if (isString(val)) {
    return 'string'
  } else if (isNumber(val)) {
    return 'int'
  } else if (isNil(val)) {
    return ["'a", 'list']
  } else {
    throw Error('Unexpected literal value to type')
  }
}

const constructFuncType = (args: Array<any>, ret: any): FunctionType => {
  const params = []

  for (let j = 0; j < args.length; j++) {
    const arg = args[j]
    params.push(arg.tag === 'id' ? findTypeInEnv(arg.sym) : arg.type)
  }

  return {
    args: params,
    return: ret
  }
}

/**
 * Type Environment Support
 */

export interface TypeEnv {
  tail: TypeEnv | null
  head: TypeFrame
  index: number
}

export interface TypeFrame {
  [name: string]: SmlType
}

export const resetTypeEnv = () => {
  typeEnv = {
    head: {},
    tail: null,
    index: 0
  }
}

export const getTypeEnv = (): TypeEnv => {
  return typeEnv
}

export const extendTypeEnv = (vars: string[], types: SmlType[]): TypeEnv => {
  const newFrame = {}
  for (let i = 0; i < vars.length; i++) {
    newFrame[vars[i]] = types[i]
  }
  typeEnv = {
    tail: typeEnv,
    head: newFrame,
    index: typeEnv.index
  }
  return typeEnv
}

export const addToTypeFrame = (vars: string, type: SmlType, offset: number = 0) => {
  let env: TypeEnv = typeEnv
  let schemeEnv: TypeSchemeEnv = typeSchemeEnv
  while (offset > 0 && env.tail && schemeEnv.tail) {
    env = env.tail
    schemeEnv = schemeEnv.tail
    offset--
  }

  if (isTypedFun(type)) {
    // add to type scheme env, remove key from typeEnv
    delete env.head[vars]
    const funcType = smlToFuncType(type)
    return (schemeEnv.head[vars] = funcType)
    return funcType
  }
  // remove key from typeSchemeEnv
  delete schemeEnv.head[vars]
  env.head[vars] = type
  return type
}

export const restoreTypeEnv = (env: TypeEnv) => {
  typeEnv = env
}

export const newTypeVar = (): FreeType => {
  const newTypeVar: FreeType = `T${typeEnv.index}`
  typeEnv.index++
  return newTypeVar
}

export const findTypeInEnv = (vars: string): SmlType => {
  let env: TypeEnv | null = typeEnv
  let schemeEnv: TypeSchemeEnv | null = typeSchemeEnv
  while (env && schemeEnv) {
    const frame: TypeFrame = env.head
    const schemeFrame: TypeSchemeFrame = schemeEnv.head
    if (frame.hasOwnProperty(vars)) {
      return frame[vars]
    }
    if (schemeFrame.hasOwnProperty(vars)) {
      const scheme = schemeFrame[vars] as FunctionType
      const params = scheme.args.length === 1 ? scheme.args[0] : scheme.args.concat['tuple']
      return [params, scheme.return, 'fun']
      // return schemeFrame[vars] as FunctionType
    }
    env = env.tail
    schemeEnv = schemeEnv.tail
  }
  throw Error(`Unbound variable ${vars}`)
}

export const isInTypeEnv = (vars: string): boolean => {
  let env: TypeEnv | null = typeEnv
  while (env) {
    const frame: TypeFrame = env.head
    if (frame.hasOwnProperty(vars)) {
      return true
    }
    env = env.tail
  }
  return false
}

const replaceTypeVar = (toReplace: FreeType, replacement: SmlType) => {
  let env: TypeEnv | null = typeEnv
  let schemeEnv: TypeSchemeEnv | null = typeSchemeEnv
  while (env && schemeEnv) {
    const frame: TypeFrame = env.head
    const schemeFrame: TypeSchemeFrame = schemeEnv.head
    for (const key in frame) {
      if (frame[key] === toReplace) {
        frame[key] = replacement
      }
    }
    for (const key in schemeFrame) {
      const scheme = schemeFrame[key]
      if (Array.isArray(scheme)) {
        for (let i = 0; i < scheme.length; i++) {
          const curr = scheme[i]
          curr.args = curr.args.map(x => (x === toReplace ? replacement : x))
          curr.return = curr.return === toReplace ? replacement : curr.return
        }
      } else {
        scheme.args = scheme.args.map(x => (x === toReplace ? replacement : x))
        scheme.return = scheme.return === toReplace ? replacement : scheme.return
      }
    }
    schemeEnv = schemeEnv.tail
    env = env.tail
  }
}

// finds most recent occurance of sym in the env, if its a free variable (i.e. T0)
// replace it with a free function type (i.e. Tn1 -> Tn2)
export const modifyTypeScheme = (sym: string, replacement: FunctionType) => {
  let env: TypeEnv | null = typeEnv
  let schemeEnv: TypeSchemeEnv | null = typeSchemeEnv
  while (env && schemeEnv) {
    const frame: TypeFrame = env.head
    const schemeFrame: TypeSchemeFrame = schemeEnv.head
    if (schemeFrame.hasOwnProperty(sym)) {
      return
    }
    if (frame.hasOwnProperty(sym)) {
      if (isTypeVar(frame[sym])) {
        delete frame[sym]
        schemeFrame[sym] = replacement
      }
      return
    }
    schemeEnv = schemeEnv.tail
    env = env.tail
  }
  throw Error(`Unbound variable ${sym}`)
}

/**
 * Type Scheme Environment Support
 */

export interface TypeSchemeEnv {
  tail: TypeSchemeEnv | null
  head: TypeSchemeFrame
}

export interface FunctionType {
  args: Array<SmlType>
  return: SmlType
}

export interface TypeSchemeFrame {
  [name: string]: FunctionType | Array<FunctionType>
}

export const resetSchemeEnv = () => {
  const tail = {
    head: PRIM_TYPE_SCHEME,
    tail: null
  }
  typeSchemeEnv = {
    head: {},
    tail
  }
}

export const getSchemeEnv = (): TypeSchemeEnv => {
  return typeSchemeEnv
}

export const newSchemeVar = (): FunctionType => {
  return {
    args: [newTypeVar()],
    return: newTypeVar()
  }
}

export const extendSchemeEnv = (vars: string[], schemes: FunctionType[]): TypeSchemeEnv => {
  const newFrame = {}
  for (let i = 0; i < vars.length; i++) {
    newFrame[vars[i]] = schemes[i]
  }
  typeSchemeEnv = {
    tail: typeSchemeEnv,
    head: newFrame
  }
  return typeSchemeEnv
}

export const addToSchemeFrame = (vars: string, type: FunctionType | Array<FunctionType>) => {
  delete typeEnv.head[vars]
  typeSchemeEnv.head[vars] = type
}

export const restoreSchemeEnv = (env: TypeSchemeEnv) => {
  typeSchemeEnv = env
}

export const findSchemeInEnv = (vars: string): FunctionType | Array<FunctionType> => {
  let env: TypeSchemeEnv | null = typeSchemeEnv
  while (env) {
    const frame: TypeSchemeFrame = env.head
    if (frame.hasOwnProperty(vars)) {
      return frame[vars]
    }
    env = env.tail
  }
  throw Error(`Unbound variable ${vars}`)
}

/**
 * Partial Evaluation
 */

export const partialEvaluate = (args: any[], op: any, expr: 'binop' | 'unop' | 'cond') => {
  switch (expr) {
    case 'binop':
      return partialEvaluateBinop(args, op)
    case 'unop':
      return partialEvaluateUnop(args, op)
    case 'cond':
      return partialEvaluateCond(args, op)
    default:
      return [false, undefined]
  }
}

const partialEvaluateUnop = (args: any[], op: string) => {
  if (args.length !== 1) {
    throw Error(`Partial evaluation of unop expects 1 arg, got ${args.length} arg(s).`)
  }

  if (args[0].tag !== 'lit') {
    return [false, undefined]
  }

  const elem = { type: args[0].type, value: args[0].val }
  return [true, unaryOp(op as es.UnaryOperator, elem)]
}

const partialEvaluateBinop = (args: any[], op: string) => {
  if (args.length !== 2) {
    throw Error(`Partial evaluation of unop expects 2 args, got ${args.length} arg(s).`)
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i].tag !== 'lit') {
      return [false, undefined]
    }
  }

  const left = { type: args[0].type, value: args[0].val }
  const right = { type: args[1].type, value: args[1].val }
  return [true, binaryOp(op as es.BinaryOperator, left, right)]
}

const partialEvaluateCond = (args: any[], pred: any) => {
  if (args.length !== 2) {
    throw Error(
      `Partial evaluation of conditional expression expects 2 args, got ${args.length} arg(s).`
    )
  }

  // unable to pre select branch
  if (pred.tag != 'lit') {
    return [false, undefined]
  }

  if (pred.val) {
    return [true, args[0]]
  } else {
    return [true, args[1]]
  }
}

/**
 * Type Checking Support
 */

export const typeSchemeCheck = (name: string, args: Array<any>, ret: any) => {
  let found = undefined

  if (name === '::' || name === '@') {
    return unifyListOp(name, args)
  }

  let expectedTypes: FunctionType | Array<FunctionType> = findSchemeInEnv(name)

  if (!Array.isArray(expectedTypes)) {
    expectedTypes = [expectedTypes]
  }

  for (let i = 0; i < expectedTypes.length; i++) {
    const schemeType: FunctionType = expectedTypes[i]
    const currType: FunctionType = constructFuncType(args, ret)
    const substituted = unifyScheme(schemeType, currType)

    if (substituted) {
      found = substituted
      break
    } else if (i === expectedTypes.length - 1) {
      // no more possible scheme to match
      throw new FunctionTypeError(expectedTypes[0], currType)
    }
  }

  return found
}

/**
 * Unification Functions
 */

export const unifyScheme = (schemeType: FunctionType, givenType: FunctionType) => {
  if (schemeType.args.length !== givenType.args.length) {
    return undefined
  }

  const args = []

  for (let i = 0; i < schemeType.args.length; i++) {
    const schemeElem = schemeType.args[i]
    const givenElem = givenType.args[i]
    const substitued = constrainType(schemeElem, givenElem)
    if (substitued === undefined) {
      return undefined
    }
    args.push(substitued)
  }

  const resultType = constrainType(schemeType.return, givenType.return)
  if (!resultType) {
    // wrong error msg
    return undefined
  }

  return {
    args,
    return: resultType
  }
}

export const unifyReturnType = (annotation: SmlType, actual: SmlType) => {
  const type = constrainType(annotation, actual)

  if (!type) {
    throw new ReturnTypeError(annotation, actual)
  }

  return type
}

export const unifyBranches = (cons: SmlType, alt: SmlType) => {
  const type = constrainType(cons, alt)

  if (!type) {
    throw new MatchTypeError(cons, alt)
  }

  return type
}

function unifyListOp(op: '::' | '@', args: any[]) {
  let type = undefined
  const left = args[0]
  const right = args[1]

  switch (op) {
    case '::':
      type = unifyListConstruct(left, right)
      break
    case '@':
      type = unifyListAppend(left, right)
      break
    default:
      throw Error('Unsupported list operation ' + op)
  }

  if (!type) {
    throw new FunctionTypeError(LIST_SCHEME, { args, return: newTypeVar() })
  }
  return { args, return: type }
}

function unifyListConstruct(left: SmlType[], right: SmlType[]) {
  if (!isTypedList(right)) {
    // right side needs to be some list
    return
  }

  if (isFreeList(right)) {
    // valid construct
    let typeArr = right
    if (!isFreeList(left)) {
      // assign a fixed type
      typeArr[0] = isTypedList(left) ? left[0] : left
      if (isTypedList(left)) {
        typeArr.push('list')
      }
    } else if (getListDepth(right) <= getListDepth(left)) {
      typeArr = left
      typeArr.push('list')
    }
    return typeArr
  }

  // For valid ::, LHS type must match elem type of list in RHS
  const rightTypeArr: Array<SmlType> = right
  const expectedTypeArr: Array<SmlType> = rightTypeArr.slice(0, rightTypeArr.length - 1)
  const gotTypeArr: Array<SmlType> = isListOrTuple(left) ? left : [left]

  if (isStrictEqual(gotTypeArr, expectedTypeArr)) {
    return right
  }
  return
}

function unifyListAppend(left: SmlType[], right: SmlType[]) {
  if (!isTypedList(right) || !isTypedList(left)) {
    // right side needs to be some list
    return
  }

  if (isFreeList(left)) {
    // right must be a superset OR any free list
    if (isFreeList(right) || constrainType(right, left)) {
      return right
    }
  } else {
    // right must be a free list of <= left depth OR same type
    if (
      (isFreeList(right) && getListDepth(right) <= getListDepth(left)) ||
      isStrictEqual(left, right)
    ) {
      return left
    }
  }
  return
}

export const unifyListLitType = (currType: SmlType, newType: SmlType): SmlType => {
  if (constrainType(currType, newType)) {
    return isFreeList(currType)
      ? isFreeList(newType)
        ? getListDepth(currType) >= getListDepth(newType)
          ? currType
          : newType
        : newType
      : currType
  } else {
    if (Array.isArray(currType)) {
      currType.push('list')
    }
    throw new FunctionTypeError(LIST_SCHEME, { args: [newType, currType], return: newTypeVar() })
  }
}

/**
 * Constrain Functions
 */

const constrainType = (scheme: SmlType, given: SmlType | undefined): any => {
  if (!given) {
    return scheme
  }

  if (isTypeVar(given) || isTypeVar(scheme)) {
    const toReplace = isTypeVar(given) ? given : scheme
    const replacement = isTypeVar(given) ? scheme : given

    replaceTypeVar(toReplace as FreeType, replacement)
    return replacement
  }

  if (isTypedList(scheme) && isTypedList(given)) {
    return constrainListType(scheme, given)
  }

  if (isTypedTuple(scheme) && isTypedTuple(given)) {
    const result = []
    for (let i = 0; i < scheme.length - 1; i++) {
      const constrained = constrainType(scheme[i] as SmlType, given[i] as SmlType)
      if (!constrained) {
        return undefined
      }
      result.push(constrained)
    }
    result.push('tuple')
    return result
  }

  if (isFreeLiteral(scheme) || isFreeLiteral(given)) {
    return constrainLiteralType(scheme, given)
  }

  if (isTypedFun(scheme) && isTypedFun(given)) {
    const result = []
    for (let i = 0; i < scheme.length - 1; i++) {
      const constrained = constrainType(scheme[i] as SmlType, given[i] as SmlType)
      if (!constrained) {
        return constrained
      }
      result.push(constrained)
    }
    result.push('fun')
    return result
  }

  return isStrictEqual(scheme, given) ? scheme : undefined
}

const constrainListType = (scheme: SmlType, given: SmlType) => {
  if (isFreeList(scheme) && isFreeList(given)) {
    return getListDepth(scheme) <= getListDepth(given) ? given : scheme
  }

  if (isFreeList(scheme) && !isFreeList(given)) {
    return getListDepth(scheme) <= getListDepth(given) ? given : undefined
  }

  if (!isFreeList(scheme) && isFreeList(given)) {
    return getListDepth(scheme) >= getListDepth(given) ? scheme : undefined
  }

  if (!isFreeList(scheme) && !isFreeList(given)) {
    return isStrictEqual(scheme, given) ? scheme : undefined
  }

  return undefined
}

const constrainLiteralType = (scheme: SmlType, given: SmlType) => {
  if (isFreeLiteral(scheme) && !isFreeLiteral(given)) {
    return given
  }

  if (isFreeLiteral(given) && !isFreeLiteral(scheme)) {
    return scheme
  }

  return scheme
}

export const getDeclaredListType = (first: SmlType | undefined): SmlType => {
  if (first === undefined) {
    return ["'a", 'list']
  } else {
    const typeArr = isTypedList(first) ? first : [first]
    if (!Array.isArray(typeArr)) {
      throw Error('Cannot push to a non array type.')
    }

    return typeArr.concat(['list'])
  }
}
