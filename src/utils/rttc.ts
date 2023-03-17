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
const isTypedList = (v: TypedValue) => v.type === 'list' && Array.isArray(v.value) && v.typeArr
const isFreeList = (v: TypedValue) => isTypedList(v) && v.typeArr![0] === "'a"
const isTypedTuple = (v: TypedValue) => v.type === 'tuple' && Array.isArray(v.value) && v.typeArr
const isListOrTuple = (v: TypedValue) => isTypedList(v) || isTypedTuple(v)

const getListDepth = (v: TypedValue) => {
  if (isTypedList(v)) {
    let depth = 0
    const typeArr = v.typeArr!
    for (let i = typeArr.length - 1; i >= 0; i--) {
      if (typeArr[i] === 'list') {
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
    return left.typeArr?.toString() === right.typeArr?.toString()
  } else {
    return left.type === right.type
  }
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

  return isTypeEqual(superset, subset)
}

const getTypeString = (val: TypedValue | string): string => {
  if (typeof val === 'string') {
    return val
  } else if (isTypedList(val)) {
    return typeArrToString(val.typeArr!)
  } else if (isTypedTuple(val)) {
    return typeArrToString(val.typeArr!)
  } else {
    return val.type
  }
}

const typeArrToString = (arr: SmlType[]) => {
  if (arr[arr.length - 1] == 'list') {
    let str = ''

    arr.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += ' ' + typeArrToString(element)
      } else {
        str += ' ' + element
      }
    })

    return str.trim()
  } else {
    let str = ''

    arr.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += ' * ' + typeArrToString(element)
      } else {
        str += ' * ' + element
      }
    })

    return str.substring(3)
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
      type: 'list',
      typeArr: ["'a", 'list'],
      value: []
    }
  } else {
    const typeArr = isListOrTuple(first) ? first.typeArr! : [first.type]
    typeArr.push('list')

    return {
      type: 'list',
      typeArr: typeArr,
      value: val
    }
  }
}

export const getConstructedTypedList = (
  left: TypedValue,
  right: TypedValue,
  val: any
): TypedValue => {
  let typeArr = right.typeArr!

  if (isFreeList(right)) {
    if (!isFreeList(left)) {
      // assign a fixed type
      typeArr[0] = isTypedList(left) ? left.typeArr![0] : left.type
      if (isTypedList(left)) {
        typeArr.push('list')
      }
    } else if (getListDepth(right) <= getListDepth(left)) {
      typeArr = left.typeArr!
      typeArr.push('list')
    }
  }

  return {
    type: 'list',
    typeArr: typeArr,
    value: val
  }
}

export const getAppendedTypedList = (left: TypedValue, right: TypedValue, val: any): TypedValue => {
  let typeArr = left.typeArr!

  if (isFreeList(left)) {
    typeArr =
      isFreeList(right) && getListDepth(left) < getListDepth(right) ? right.typeArr! : left.typeArr!
  }

  return {
    type: 'list',
    typeArr: typeArr,
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
      type: 'list',
      typeArr: ["'a", 'list'],
      value: []
    }
  } else {
    throw Error('Unexpected literal to type')
  }
}

const getType = (type: any) => {
  if (Array.isArray(type)) {
    return type[type.length - 1] === 'list' ? 'list' : 'tuple'
  } else {
    return type
  }
}

export const getTypedTupleElem = (val: any, index: number) => {
  const elem = val.value[index]
  const type = getType(val.typeArr[index])
  return {
    type,
    typeArr: type === 'list' || type === 'tuple' ? val.typeArr[index] : undefined,
    value: elem
  }
}

// export const getListElemType = (v: TypedValue) => {
//   const type = v.typeArr
//   type?.pop()
//   return type
// }

export const getElemType = (v: TypedValue) => {
  if (isListOrTuple(v)) {
    return v?.typeArr
  } else {
    return v.type
  }
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

const checkConstructExpression = (node: es.Node, left: TypedValue, right: TypedValue) => {
  if (!isTypedList(right)) {
    // right side needs to be some list
    return new TypeError(node, RHS, 'list', right)
  }

  if (isFreeList(right)) {
    // skip type checking
    return
  }

  // For valid ::, LHS type must match elem type of list in RHS
  const rightTypeArr: Array<SmlType> = right.typeArr!
  const expectedTypeArr: Array<SmlType> = rightTypeArr.slice(0, rightTypeArr.length - 1)
  const gotTypeArr: Array<SmlType> = isListOrTuple(left) ? left.typeArr! : [left.type]

  if (!isTypeArrEqual(gotTypeArr, expectedTypeArr)) {
    return new TypeError(node, LHS, typeArrToString(expectedTypeArr), typeArrToString(gotTypeArr))
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
