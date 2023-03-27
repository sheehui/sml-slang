import * as es from 'estree'

import { UNKNOWN_LOCATION } from '../constants'
import { ErrorSeverity, ErrorType, SourceError } from '../types'

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
