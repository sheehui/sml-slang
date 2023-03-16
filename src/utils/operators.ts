import { BinaryOperator, SourceLocation,UnaryOperator } from 'estree'

import { LazyBuiltIn } from '../createContext'
import {
  CallingNonFunctionValue,
  ExceptionError,
  InvalidNumberOfArguments
} from '../errors/errors'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Thunk, TypedValue } from '../types'
import * as create from './astCreator'
import { makeWrapper } from './makeWrapper'
import * as rttc from './rttc'

export function forceIt(val: Thunk | any): any {
  if (val !== undefined && val !== null && val.isMemoized !== undefined) {
    if (val.isMemoized) {
      return val.memoizedValue
    }

    const evaluatedValue = forceIt(val.f())

    val.isMemoized = true
    val.memoizedValue = evaluatedValue

    return evaluatedValue
  } else {
    return val
  }
}

export function wrapLazyCallee(candidate: any) {
  candidate = forceIt(candidate)
  if (typeof candidate === 'function') {
    const wrapped: any = (...args: any[]) => candidate(...args.map(forceIt))
    makeWrapper(candidate, wrapped)
    wrapped[Symbol.toStringTag] = () => candidate.toString()
    wrapped.toString = () => candidate.toString()
    return wrapped
  } else if (candidate instanceof LazyBuiltIn) {
    if (candidate.evaluateArgs) {
      const wrapped: any = (...args: any[]) => candidate.func(...args.map(forceIt))
      makeWrapper(candidate.func, wrapped)
      wrapped[Symbol.toStringTag] = () => candidate.toString()
      wrapped.toString = () => candidate.toString()
      return wrapped
    } else {
      return candidate
    }
  }
  // doesn't look like a function, not our business to error now
  return candidate
}

export function makeLazyFunction(candidate: any) {
  return new LazyBuiltIn(candidate, false)
}

export function callIfFuncAndRightArgs(
  candidate: any,
  line: number,
  column: number,
  ...args: any[]
) {
  const dummy = create.callExpression(create.locationDummyNode(line, column), args, {
    start: { line, column },
    end: { line, column }
  })

  if (typeof candidate === 'function') {
    const originalCandidate = candidate
    if (candidate.transformedFunction !== undefined) {
      candidate = candidate.transformedFunction
    }
    const expectedLength = candidate.length
    const receivedLength = args.length
    const hasVarArgs = candidate.minArgsNeeded !== undefined
    if (hasVarArgs ? candidate.minArgsNeeded > receivedLength : expectedLength !== receivedLength) {
      throw new InvalidNumberOfArguments(
        dummy,
        hasVarArgs ? candidate.minArgsNeeded : expectedLength,
        receivedLength,
        hasVarArgs
      )
    }
    try {
      const forcedArgs = args.map(forceIt)
      return originalCandidate(...forcedArgs)
    } catch (error) {
      // if we already handled the error, simply pass it on
      if (!(error instanceof RuntimeSourceError || error instanceof ExceptionError)) {
        throw new ExceptionError(error, dummy.loc!)
      } else {
        throw error
      }
    }
  } else if (candidate instanceof LazyBuiltIn) {
    try {
      if (candidate.evaluateArgs) {
        args = args.map(forceIt)
      }
      return candidate.func(...args)
    } catch (error) {
      // if we already handled the error, simply pass it on
      if (!(error instanceof RuntimeSourceError || error instanceof ExceptionError)) {
        throw new ExceptionError(error, dummy.loc!)
      } else {
        throw error
      }
    }
  } else {
    throw new CallingNonFunctionValue(candidate, dummy)
  }
}

export function boolOrErr(candidate: any, line: number, column: number) {
  candidate = forceIt(candidate)
  const error = rttc.checkIfStatement(create.locationDummyNode(line, column), candidate)
  if (error === undefined) {
    return candidate
  } else {
    throw error
  }
}

export function unaryOp(operator: UnaryOperator, argument: any, loc: SourceLocation) {
  argument = forceIt(argument)
  const line = loc.start.line;
  const column = loc.start.column
  const error = rttc.checkUnaryExpression(
    create.locationDummyNode(line, column),
    operator,
    argument
  )
  if (error === undefined) {
    return evaluateUnaryExpression(operator, argument)
  } else {
    throw error
  }
}

export function evaluateUnaryExpression(operator: UnaryOperator, value: any) {
  if (operator === '~') {
    return !value.value
  } else if (operator === '-') {
    return -value.value
  } else {
    return +value.value
  }
}

export function binaryOp(
  operator: BinaryOperator | string,
  left: TypedValue,
  right: TypedValue,
  loc: SourceLocation
) {
  left = forceIt(left)
  right = forceIt(right)
  const line = loc.start.line
  const column = loc.start.column
  const error = rttc.checkBinaryExpression(
    create.locationDummyNode(line, column),
    operator,
    left,
    right
  )
  if (error === undefined) {
    return evaluateBinaryExpression(operator, left, right)
  } else {
    throw error
  }
}

const executeAppend = (left: any, right: any) => {
  // RHS guaranteed to be a list
  return [left].concat(right) // Append is right associative
}

export function evaluateBinaryExpression(operator: BinaryOperator | string, left: any, right: any) {
  const l = left.value
  const r = right.value
  switch (operator) {
    case '+':
    case '^':
      return l + r
    case '-':
      return l - r
    case '*':
      return l * r
    case '/':
      return Math.floor(l / r)
    case '%':
      return l % r
    case '===':
      return l === r
    case '!==':
      return l !== r
    case '<=':
      return l <= r
    case '<':
      return l < r
    case '>':
      return l > r
    case '>=':
      return l >= r
    case '::':
      return executeAppend(l, r)
    default:
      return Error("Invalid binary operator " + operator)
  }
}

// export const setProp = (obj: any, prop: any, value: any, line: number, column: number) => {
//   const dummy = locationDummyNode(line, column)
//   const error = rttc.checkMemberAccess(dummy, obj, prop)
//   if (error === undefined) {
//     return (obj[prop] = value)
//   } else {
//     throw error
//   }
// }

// export const getProp = (obj: any, prop: any, line: number, column: number) => {
//   const dummy = locationDummyNode(line, column)
//   const error = rttc.checkMemberAccess(dummy, obj, prop)
//   if (error === undefined) {
//     if (obj[prop] !== undefined && !obj.hasOwnProperty(prop)) {
//       throw new GetInheritedPropertyError(dummy, obj, prop)
//     } else {
//       return obj[prop]
//     }
//   } else {
//     throw error
//   }
// }
