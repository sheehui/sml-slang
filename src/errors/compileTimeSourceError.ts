import * as es from 'estree'

import { UNKNOWN_LOCATION } from '../constants'
import { ErrorSeverity, ErrorType, SmlType, SourceError } from '../types'
import { FunctionType } from '../utils/cttc'
import { argToString, functionTypeToString, smlTypeToString } from '../utils/formatters'

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

  constructor(public expected: FunctionType, public got: FunctionType) {
    super()
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
    super()
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

export class PredicateTypeError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public got: SmlType) {
    super()
    this.got = got
  }

  public explain() {
    return `Expected predicate of type "bool", got "${smlTypeToString(this.got)}".`
  }

  public elaborate() {
    return this.explain()
  }
}

export class MatchTypeError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public expected: SmlType, public got: SmlType) {
    super()
    this.expected = expected
    this.got = got
  }

  public explain() {
    return `Match rules disagree on type: Cannot merge "${smlTypeToString(
      this.expected
    )}" and "${smlTypeToString(this.got)}".`
  }

  public elaborate() {
    return this.explain()
  }
}

export class PatternMatchError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public got: SmlType) {
    super()
    this.got = got
  }

  public explain() {
    return `Expected pattern of record type, got "${smlTypeToString(this.got)}".`
  }

  public elaborate() {
    return this.explain()
  }
}

export class PatternLenMatchError extends CompileTimeSourceError {
  public type = ErrorType.COMPILE_TIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public expected: number, public got: number) {
    super()
    this.expected = expected
    this.got = got
  }

  public explain() {
    return `Expected a record type with ${this.expected} entries, but the given record has ${this.got} entries.`
  }

  public elaborate() {
    return this.explain()
  }
}
