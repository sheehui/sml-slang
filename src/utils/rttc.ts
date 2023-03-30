import * as es from 'estree'

import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { ErrorSeverity, ErrorType, SmlType, TypedValue, Value } from '../types'

const LHS = ' on left hand side of operation'
const RHS = ' on right hand side of operation'

export class TypeError extends RuntimeSourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(
    node: es.Node,
    public side: string,
    public expected: TypedValue | string,
    public got: TypedValue | string
  ) {
    super(node)
    this.expected = getTypeString(expected)
    this.got = getTypeString(got)
  }

  public explain() {
    return `Expected ${getTypeString(this.expected)}${this.side}, got ${getTypeString(this.got)}.`
  }

  public elaborate() {
    return this.explain()
  }
}

const isNumber = (v: Value) => typeOf(v) === 'number'
// See section 4 of https://2ality.com/2012/12/arrays.html
// v >>> 0 === v checks that v is a valid unsigned 32-bit int
// tslint:disable-next-line:no-bitwise
const isArrayIndex = (v: Value) => isNumber(v) && v >>> 0 === v && v < 2 ** 32 - 1
const isString = (v: Value) => typeOf(v) === 'string'
const isBool = (v: Value) => typeOf(v) === 'boolean'
const isNil = (v: Value) => typeOf(v) === 'null'

const isTypedNumber = (v: TypedValue) => v.type === 'int'
const isTypedString = (v: TypedValue) => v.type === 'string'
const isTypedBool = (v: TypedValue) => v.type === 'bool'
const isFreeLiteral = (v: TypedValue) => v.type === "'a"
const isTypedList = (v: TypedValue) =>
  Array.isArray(v.type) && v.type[v.type.length - 1] === 'list' 
const isFreeList = (v: TypedValue) => isTypedList(v) && v.type[0] === "'a"
const isTypedTuple = (v: TypedValue) =>
  Array.isArray(v.type) && v.type[v.type.length - 1] === 'tuple' 
const isListOrTuple = (v: TypedValue) => isTypedList(v) || isTypedTuple(v)

const getListDepth = (v: TypedValue) => {
  if (isTypedList(v)) {
    let depth = 0
    for (let i = v.type.length - 1; i >= 0; i--) {
      if (v.type[i] === 'list') {
        depth++
      } else {
        break
      }
    }
    return depth
  }
  throw Error('cannot get list depth of non-list type')
}

// We need to define our own typeof in order for null/array to display properly in error messages
const typeOf = (v: Value) => {
  if (v === null) {
    return 'null'
  } else if (Array.isArray(v)) {
    return 'array'
  } else {
    return typeof v
  }
}

export const isTypeEqual = (left: TypedValue, right: TypedValue): boolean => {
  if ((isTypedList(left) && isTypedList(right)) || (isTypedTuple(left) && isTypedTuple(right))) {
    return left.type.toString() === right.type.toString()
  } else {
    return left.type === right.type
  }
}

export const typeArrEqual = (left: SmlType, right: SmlType): boolean => {
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

export const isTypeArrSubset = (superset: SmlType, subset: SmlType): undefined | SmlType => {
  // if is subset, return subset type, else return undefined 
  // wrap types in dummy TypedValues (we do not use the value attribute)
  const isSubset = isTypeSubset({ type: superset, value: 0 }, { type: subset, value: 0 })
  return isSubset ? subset : undefined 
}

const isTypeSubset = (superset: TypedValue, subset: TypedValue): boolean => {
  if (isTypedList(superset) && isTypedList(subset)) {
    return isFreeList(superset)
      ? isFreeList(subset)
        ? true
        : getListDepth(superset) <= getListDepth(subset)
      : isFreeList(subset)
      ? getListDepth(superset) >= getListDepth(subset)
      : isTypeEqual(superset, subset)
  }

  if (isTypedTuple(superset) && isTypedTuple(subset)) {
    // recursion
  }

  if (isFreeLiteral(superset) || isFreeLiteral(subset)) {
    return true
  }

  return typeArrEqual(superset.type, subset.type)
}

const getTypeString = (val: TypedValue | string): string => {
  if (typeof val === 'string') {
    return val
  } else if (Array.isArray(val.type)) {
    if (isTypedList(val) || isTypedTuple(val)) {
      return typeToString(val.type)
    }
    throw Error('Unable to get type of non-list/tuple array for SmlType.type')
  } else {
    return val.type
  }
}

export const typeToString = (type: SmlType) : string => {
  const isTypeArr = Array.isArray(type) 
  if (isTypeArr && type[type.length - 1] == 'list') {
    let str = ''

    type.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += ' ' + typeToString(element)
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
        str += " * "
      }
      if (Array.isArray(element)) {
        str += typeToString(element)
      } else {
        str += element
      }
    }
    str += ')'

    return str
  } else if (isTypeArr && type[type.length - 1] == 'fun') {
    const paramsType = Array.isArray(type[0]) ? typeToString(type[0]) : type[0]
    const retType = Array.isArray(type[1]) ? typeToString(type[1]) : type[1]

    return `${paramsType} -> ${retType}`
  } else {
    return type.toString()
  }
}

export const getTypedTupleElem = (node: es.Node, val: any, index: number): TypedValue => {
  if (index < 0 || index >= val.value.length) {
    throw Error('index out of bounds')
  }

  if (!isTypedTuple(val)) {
    throw new TypeError(node, '', 'a tuple', val)
  }

  const value = val.value[index]
  const type = val.type[index]
  return {
    type,
    value
  }
}

export const getElemType = (v: TypedValue) => {
  return v.type
}

export const checkIfStatement = (node: es.Node, test: TypedValue) => {
  return isTypedBool(test) ? undefined : new TypeError(node, ' as condition', 'boolean', test)
}

export const isIdentifier = (node: any): node is es.Identifier => {
  return (node as es.Identifier).name !== undefined
}
