import * as es from 'estree'

import { UNKNOWN_LOCATION } from '../constants'
import { ErrorSeverity, ErrorType, SmlType, SourceError } from '../types'
import { FunctionType } from '../utils/cttc'

export class CompileTimeSourceError implements SourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node?: es.Node) {
    this.location = node ? node.loc! : UNKNOWN_LOCATION
  }

  public explain() {
    return ''
  }

  public elaborate() {
    return this.explain()
  }
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