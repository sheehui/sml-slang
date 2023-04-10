import { BinaryOperator, UnaryOperator } from 'estree'

import { LazyBuiltIn } from '../createContext'
import { DivisionError } from '../errors/runtimeSourceError'
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

export function boolOrErr(candidate: any, line: number, column: number) {
  candidate = forceIt(candidate)
  const error = rttc.checkIfStatement(create.locationDummyNode(line, column), candidate)
  if (error === undefined) {
    return candidate
  } else {
    throw error
  }
}

export function unaryOp(operator: UnaryOperator, argument: any) {
  forceIt(argument)
  return evaluateUnaryExpression(operator, argument)
}

export function evaluateUnaryExpression(operator: UnaryOperator, value: any) {
  if (operator === '!') {
    return !value.value
  } else if (operator === '~') {
    return -value.value
  } else {
    return +value.value
  }
}

export function binaryOp(
  operator: BinaryOperator | '::' | '@',
  left: TypedValue,
  right: TypedValue
) {
  left = forceIt(left)
  right = forceIt(right)
  return evaluateBinaryExpression(operator, left, right)
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
      if (r === 0) {
        throw new DivisionError('Div: Unable to evaluate division by zero.')
      }
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
      return [l].concat(r)
    case '@':
      l.push(...r)
      return l
    default:
      return Error('Invalid binary operator ' + operator)
  }
}
