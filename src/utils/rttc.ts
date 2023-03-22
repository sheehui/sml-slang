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
const isTypedBool = (v: TypedValue) => v.type === 'boolean'
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

export const updateListType = (
  currType: TypedValue,
  newType: TypedValue,
  node: es.Node
): TypedValue => {
  if (isTypeSubset(currType, newType)) {
    return isFreeList(currType)
      ? isFreeList(newType)
        ? getListDepth(currType) >= getListDepth(newType)
          ? currType
          : newType
        : newType
      : currType
  } else {
    throw new TypeError(node, ' or its subset', currType, newType)
  }
}

export const getDeclaredTypedList = (first: TypedValue | undefined, val: any): TypedValue => {
  if (first === undefined) {
    return {
      type: ["'a", 'list'],
      value: []
    }
  } else {
    const typeArr = isTypedList(first) ? first.type : [first.type]

    if (!Array.isArray(typeArr)) {
      throw Error('Cannot push to a non array type.')
    }

    typeArr.push('list')

    return {
      type: typeArr,
      value: val
    }
  }
}

export const getConstructedTypedList = (left: any, right: any, val: any): TypedValue => {
  let typeArr = right.type

  if (isFreeList(right)) {
    if (!isFreeList(left)) {
      // assign a fixed type
      typeArr[0] = isTypedList(left) ? left.type[0] : left.type
      if (isTypedList(left)) {
        typeArr.push('list')
      }
    } else if (getListDepth(right) <= getListDepth(left)) {
      typeArr = left.type
      typeArr.push('list')
    }
  }

  return {
    type: typeArr,
    value: val
  }
}

export const getAppendedTypedList = (left: any, right: any, val: any): TypedValue => {
  let typeArr = left.type

  if (isFreeList(left)) {
    typeArr = isFreeList(right) && getListDepth(left) < getListDepth(right) ? right.type : left.type
  }

  return {
    type: typeArr,
    value: val
  }
}

export const getTypedLiteral = (val: any): TypedValue => {
  if (isBool(val)) {
    return { type: 'boolean', value: val }
  } else if (isString(val)) {
    return { type: 'string', value: val }
  } else if (isNumber(val)) {
    return { type: 'int', value: val }
  } else if (isNil(val)) {
    return {
      type: ["'a", 'list'],
      value: []
    }
  } else {
    throw Error('Unexpected literal to type')
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

export const checkUnaryExpression = (
  node: es.Node,
  operator: es.UnaryOperator,
  value: TypedValue
) => {
  if (operator === '-' && !isTypedNumber(value)) {
    return new TypeError(node, '', 'number', value)
  } else if (operator === '~' && !isTypedBool(value)) {
    return new TypeError(node, '', 'boolean', value)
  } else {
    return undefined
  }
}

const isTypeArrEqual = (expected: Array<SmlType>, got: Array<SmlType>) => {
  return expected.toString() === got.toString()
}

const checkConstructExpression = (node: es.Node, left: any, right: any) => {
  if (!isTypedList(right)) {
    // right side needs to be some list
    return new TypeError(node, RHS, 'list', right)
  }

  if (isFreeList(right)) {
    // skip type checking
    return
  }

  // For valid ::, LHS type must match elem type of list in RHS
  const rightTypeArr: Array<SmlType> = right.type
  const expectedTypeArr: Array<SmlType> = rightTypeArr.slice(0, rightTypeArr.length - 1)
  const gotTypeArr: Array<SmlType> = isListOrTuple(left) ? left.type : [left.type]

  if (!isTypeArrEqual(gotTypeArr, expectedTypeArr)) {
    return new TypeError(node, LHS, typeToString(expectedTypeArr), typeToString(gotTypeArr))
  }

  return
}

const checkAppendExpression = (node: es.Node, left: TypedValue, right: TypedValue) => {
  if (!isTypedList(right)) {
    // right side needs to be some list
    return new TypeError(node, ' on right hand side of @', 'list', right)
  }

  if (!isTypedList(left)) {
    // left side needs to be some list
    return new TypeError(node, ' on left hand side of @', 'list', left)
  }

  if (isFreeList(left)) {
    // right must be a superset OR any free list
    if (isFreeList(right)) {
      return
    }

    if (!isTypeSubset(right, left)) {
      return new TypeError(node, ' or its superset on right hand side of @', left, right)
    }
  } else {
    // right must be a free list of <= left depth OR same type
    if (isFreeList(right)) {
      return getListDepth(right) <= getListDepth(left)
        ? undefined
        : new TypeError(node, ' on right hand side of @', left, right)
    }

    if (!isTypeEqual(left, right)) {
      return new TypeError(node, ' on right hand side of @', left, right)
    }
  }

  return
}

export const checkBinaryExpression = (
  node: es.Node,
  operator: es.BinaryOperator | '@' | '::',
  left: TypedValue,
  right: TypedValue
) => {
  switch (operator) {
    case '^':
      if (!isTypedString(left)) {
        return new TypeError(node, LHS, 'string', left)
      } else if (!isTypedString(right)) {
        return new TypeError(node, RHS, 'string', right)
      } else {
        return
      }
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      if (!isTypedNumber(left)) {
        return new TypeError(node, LHS, 'number', left)
      } else if (!isTypedNumber(right)) {
        return new TypeError(node, RHS, 'number', right)
      } else {
        return
      }
    case '<':
    case '<=':
    case '>':
    case '>=':
      if (isTypedNumber(left)) {
        return isTypedNumber(right) ? undefined : new TypeError(node, RHS, 'number', right)
      } else if (isTypedString(left)) {
        return isTypedString(right) ? undefined : new TypeError(node, RHS, 'string', right)
      } else {
        return new TypeError(node, LHS, 'string or number', left)
      }
    case '!==':
    case '===':
      return
    case '::':
      return checkConstructExpression(node, left, right)
    case '@':
      return checkAppendExpression(node, left, right)
    default:
      return
  }
}

export const operatorToResultType = (
  operator: es.BinaryOperator | es.UnaryOperator | '@' | '::'
): SmlType => {
  switch (operator) {
    case '^':
      return 'string'
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      return 'int'
    case '<':
    case '<=':
    case '>':
    case '>=':
    case '!==':
    case '===':
      return 'boolean'
    case '::':
      return 'list'
    case '@':
      return 'list'
    default:
      return "'a"
  }
}

export const checkIfStatement = (node: es.Node, test: TypedValue) => {
  return isTypedBool(test) ? undefined : new TypeError(node, ' as condition', 'boolean', test)
}

// export const checkMemberAccess = (node: es.Node, obj: Value, prop: Value) => {
//   if (isObject(obj)) {
//     return isString(prop) ? undefined : new TypeError(node, ' as prop', 'string', typeOf(prop))
//   } else if (isList(obj)) {
//     return isArrayIndex(prop)
//       ? undefined
//       : isNumber(prop)
//       ? new TypeError(node, ' as prop', 'array index', 'other number')
//       : new TypeError(node, ' as prop', 'array index', typeOf(prop))
//   } else {
//     return new TypeError(node, '', 'object or array', typeOf(obj))
//   }
// }

export const isIdentifier = (node: any): node is es.Identifier => {
  return (node as es.Identifier).name !== undefined
}
