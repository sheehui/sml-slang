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
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'bool', 'string', 'tuple'],
        value: [1, true, 'hello']
      })
    })
  })

  test('tuple with lists', () => {
    const code: string = '([], [1, 2], [[3], [4]]);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: [["'a", 'list'], ['int', 'list'], ['int', 'list', 'list'], 'tuple'],
        value: [[], [1, 2], [[3], [4]]]
      })
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
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 5
      })
    })
  })

  test('valid access with identifier', () => {
    const code: string = 'val x : (int*int) = (3, 5); #2 x;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 5
      })
    })
  })

  test('invalid access to a literal', () => {
    const code: string = '#2 3;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected a tuple, got int.')
    })
  })

  test('invalid access to a list', () => {
    const code: string = '#2 [3, 5];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected a tuple, got int list.')
    })
  })
})

/**
 * BASIC PATTERN MATCHING
 */

describe('basic pattern matching', () => {
  test('basic pattern matching with identifiers', () => {
    const code: string = `
      val (x,y,z) = (1,2,3);
      x; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 1
      })
    })
  })

  test('basic pattern matching with identifiers and wildcard', () => {
    const code: string = `
      val (x,_) = (1, 2);
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([{
        type: 'int',
        value: 1
      }])
    })
  })

  test('only wildcard', () => {
    const code: string = 'val _ = 2;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([])
    })
  })

  test('different number of entries', () => {
    const code: string = 'val (x, y) = (1,2,3);'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected a record type with 2 entries, but the given record has 3 entries.')
    })
  })

  test('incompatible type', () => {
    const code: string = 'val (x, y) = 1;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("Expected pattern of record type, got \"int\".")
    })
  })

  test('type annotations within pattern', () => {
    const code: string = 'val (x: int, y: bool, z: string) = (1, true, "hello");'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([{
        type: 'int',
        value: 1
      }, {
        type: 'bool',
        value: true
      }, {
        type: 'string',
        value: "hello"
      }])
    })
  })

  test('does not match type annotations', () => {
    const code: string = 'val (x: int, y: bool, z: string) = (1, true, false);'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("The annotated type \"string\" does not match expression's type \"bool\".")
    })
  })
})
