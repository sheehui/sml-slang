import * as es from 'estree'

import { CompileTimeSourceError } from '../errors/compileTimeSourceError'
import { ErrorSeverity, ErrorType, SmlType, TypedValue, Value } from '../types'

let typeEnv: TypeEnv = {
  head: {},
  tail: null
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

let typeSchemeEnv: TypeSchemeEnv = {
  head: PRIM_TYPE_SCHEME,
  tail: null
}

/**
 * Type Environment Support
 */

export interface TypeEnv {
  tail: TypeEnv | null
  head: TypeFrame
}

export interface TypeFrame {
  [name: string]: SmlType
}

export const resetTypeEnv = () => {
  typeEnv = {
    head: {},
    tail: null
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
    head: newFrame
  }
  return typeEnv
}

export const addToTypeFrame = (vars: string, type: SmlType) => {
  typeEnv.head[vars] = type
}

export const restoreTypeEnv = (env: TypeEnv) => {
  typeEnv = env
}

export const findTypeInEnv = (vars: string): SmlType => {
  let env: TypeEnv | null = typeEnv
  while (env) {
    const frame: TypeFrame = env.head
    if (frame.hasOwnProperty(vars)) {
      return frame[vars]
    }
    env = env.tail
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

/**
 * Type Scheme Environment Support
 */

export interface TypeSchemeEnv {
  tail: TypeSchemeEnv | null
  head: TypeSchemeFrame
}

interface FunctionType {
  args: Array<SmlType>
  return: SmlType
}

export interface TypeSchemeFrame {
  [name: string]: FunctionType | Array<FunctionType>
}

export const resetSchemeEnv = () => {
  typeSchemeEnv = {
    head: PRIM_TYPE_SCHEME,
    tail: null
  }
}

export const addToSchemeFrame = (vars: string, type: FunctionType | Array<FunctionType>) => {
  typeSchemeEnv.head[vars] = type
}

export const restoreSchemeEnv = (env: TypeSchemeEnv) => {
  typeSchemeEnv = env
}

const findSchemeInEnv = (vars: string): FunctionType | Array<FunctionType> => {
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
 * Type Checking Support
 */

export const typeSchemeCheck = (node: es.Node, name: string, args: Array<any>, ret: any) => {
  let expectedTypes: FunctionType | Array<FunctionType> = findSchemeInEnv(name)
  let found = undefined

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
      throw new FunctionTypeError(node, expectedTypes[0], args)
    }
  }

  return found
}

const unifyScheme = (schemeType: FunctionType, givenType: FunctionType) => {
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

  // if (!givenType.return) { // undefined
  //   givenType.return = "'a"
  // }

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

export class FunctionTypeError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node | undefined, public expected: FunctionType, public got: any) {
    super(node)
    this.expected = expected
    this.got = got
  }

  public explain() {
    return `Functions of type "${functionTypeToString(
      this.expected
    )}" cannot take in an argument of type "${argToString(this.got)}".`
  }

  public elaborate() {
    return this.explain()
  }
}

export class ReturnTypeError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public expected: SmlType, public got: SmlType) {
    super(undefined)
    this.expected = expected
    this.got = got
  }

  public explain() {
    return `The annotated type "${smlTypeToString(
      this.expected
    )}" does not match expression's type "${smlTypeToString(this.got)}".`
  }

  public elaborate() {
    return this.explain()
  }
}

const isNumber = (v: Value) => typeOf(v) === 'number'
const isString = (v: Value) => typeOf(v) === 'string'
const isBool = (v: Value) => typeOf(v) === 'boolean'
const isNil = (v: Value) => typeOf(v) === 'null'

const isTypedNumber = (v: SmlType) => v === 'int'
const isTypedString = (v: SmlType) => v === 'string'
const isTypedBool = (v: SmlType) => v === 'bool'
const isFreeLiteral = (v: SmlType) => v === "'a"
const isTypedList = (v: SmlType) => Array.isArray(v) && v[v.length - 1] === 'list'
const isFreeList = (v: SmlType) => isTypedList(v) && v[0] === "'a"
const isTypedTuple = (v: SmlType) => Array.isArray(v) && v[v.length - 1] === 'tuple'
const isListOrTuple = (v: SmlType) => isTypedList(v) || isTypedTuple(v)

const typeOf = (v: Value) => {
  if (v === null) {
    return 'null'
  } else if (v === undefined) {
    return 'undefined'
  } else {
    return typeof v
  }
}

const isTypeEqual = (left: SmlType, right: SmlType): boolean => {
  if ((isTypedList(left) && isTypedList(right)) || (isTypedTuple(left) && isTypedTuple(right))) {
    return right.toString() === left.toString()
  } else {
    return left === right
  }
}

const typeArrEqual = (left: SmlType, right: SmlType): boolean => {
  if (typeof left === 'string' && typeof right === 'string') {
    return left === right
  } else if (typeof left !== 'string' && typeof right !== 'string') {
    if (left.length !== right.length) {
      return false
    }
    for (let i = 0; i < left.length; i++) {
      if (!typeArrEqual(left[i], right[i])) {
        return false
      }
    }
    return true
  }
  return false
}

const getListDepth = (v: SmlType) => {
  if (isTypedList(v)) {
    let depth = 0
    for (let i = v.length - 1; i >= 0; i--) {
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

const functionTypeToString = (type: any): string => {
  let result = ''

  for (let i = 0; i < type.args.length; i++) {
    const element = type.args[i]
    if (i !== 0) {
      result += ' * '
    }

    result += smlTypeToString(element)
  }

  result += ' -> '

  result += smlTypeToString(type.return) // abit sus

  return result
}

const argToString = (type: any): string => {
  let result = ''

  for (let i = 0; i < type.length; i++) {
    const element = type[i].type
    if (i !== 0) {
      result += ' * '
    }

    result += smlTypeToString(element)
  }

  return result
}

const smlTypeToString = (type: SmlType): string => {
  const isTypeArr = Array.isArray(type)
  if (isTypeArr && type[type.length - 1] == 'list') {
    let str = ''

    type.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += ' ' + smlTypeToString(element)
      } else {
        str += ' ' + element
      }
    })

    return str.trim()
  } else if (isTypeArr && type[type.length - 1] == 'tuple') {
    let str = '('

    for (let i = 0; i < type.length - 1; i++) {
      const element = type[i]
      if (i !== 0) {
        str += ' * '
      }
      if (Array.isArray(element)) {
        str += smlTypeToString(element)
      } else {
        str += element
      }
    }
    str += ')'

    return str
  } else if (isTypeArr && type[type.length - 1] == 'fun') {
    const paramsType = Array.isArray(type[0]) ? smlTypeToString(type[0]) : type[0]
    const retType = Array.isArray(type[1]) ? smlTypeToString(type[1]) : type[1]

    return `${paramsType} -> ${retType}`
  } else {
    return type.toString()
  }
}

// const getTypeString = (val: TypedValue | string): string => {
//   if (typeof val === 'string') {
//     return val
//   } else if (Array.isArray(val.type)) {
//     if (isTypedList(val) || isTypedTuple(val)) {
//       return smlTypeToString(val.type)
//     }
//     throw Error('Unable to get type of non-list/tuple array for SmlType.type')
//   } else {
//     return val.type
//   }
// }

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
    return isTypeEqual(scheme, given) ? scheme : undefined
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

const constrainType = (scheme: SmlType, given: SmlType | undefined) => {
  if (!given) {
    return scheme
  }

  if (scheme === 'free') {
    return given
  }

  if (isTypedList(scheme) && isTypedList(given)) {
    return constrainListType(scheme, given)
  }

  if (isTypedTuple(scheme) && isTypedTuple(given)) {
    // recursion
  }

  if (isFreeLiteral(scheme) || isFreeLiteral(given)) {
    return constrainLiteralType(scheme, given)
  }

  return typeArrEqual(scheme, given) ? scheme : undefined
}
