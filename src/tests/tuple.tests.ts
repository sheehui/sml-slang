import { createContext, IOptions, runInContext } from '..'
import { Finished, Variant } from '../types'

const context = createContext(Variant.DEFAULT, undefined, undefined)
const options: Partial<IOptions> = {
  scheduler: 'preemptive',
  executionMethod: 'interpreter',
  variant: Variant.DEFAULT,
  useSubst: false
}

/**
 * TUPLE
 */
describe('tuple creation', () => {
  test('simple tuple', () => {
    const code: string = '(1, true, "hello");'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([1, true, 'hello'])
    })
  })

  test('tuple with lists', () => {
    const code: string = '([], [1, 2], [[3], [4]]);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[], [1, 2], [[3], [4]]])
    })
  })
})

/**
 * TUPLE ACCESS WITH #
 */
describe('tuple access', () => {
  test('valid access', () => {
    const code: string = '#2 (3, 5);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(5)
    })
  })

  test('valid access with identifier', () => {
    const code: string = 'val x : int*int = (3, 5); #2 x;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(5)
    })
  })

  test('invalid access to a literal', () => {
    const code: string = '#2 3;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("Expected a tuple, got int.")
    })
  })

  test('invalid access to a list', () => {
    const code: string = '#2 [3, 5];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("Expected a tuple, got int list.")
    })
  })
})
