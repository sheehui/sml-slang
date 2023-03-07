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
const isObject = (v: Value) => typeOf(v) === 'object'
const isList = (v: Value) => typeOf(v) === 'array'
const isNil = (v: Value) => typeOf(v) === 'null'

const isTypedNumber = (v: TypedValue) => v.type === 'int'
const isTypedString = (v: TypedValue) => v.type === 'string'
const isTypedBool = (v: TypedValue) => v.type === 'boolean'
const isTypedList = (v: TypedValue) => v.type === 'list'
const isTypedTuple = (v: TypedValue) => v.type === 'tuple'
const isListOrTuple = (v: TypedValue) => isTypedList(v) || isTypedTuple(v)


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

export const isTypeEqual = (left: TypedValue, right: TypedValue) : boolean => {
  if ((isTypedList(left) && isTypedList(right)) || (isTypedTuple(left) && isTypedTuple(right))) {
    return left.typeArr?.toString() === right.typeArr?.toString()
  } else {
    return left.type === right.type
  }
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
    let str = ""

    arr.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += " " + typeArrToString(element)
      } else {
        str += " " + element
      }
    });

    return str.trim()
  } else {
    let str = ""

    arr.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += " * " + typeArrToString(element)
      } else {
        str += " * " + element
      }
    });

    return str.substring(3)
  }
}

export const getTypedList = (first: undefined | TypedValue, val: any) => {
  if (first === undefined) {
    return { type: 'list', typeArr: [], value: val }
  } else {
    const listType = isListOrTuple(first) ? first.typeArr! : [first.type]
    listType.push('list')
    return { type: 'list', typeArr: listType, value: val }
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
    return { type: 'list', typeArr: [], value: [] }
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

export const checkBinaryExpression = (
  node: es.Node,
  operator: es.BinaryOperator,
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
