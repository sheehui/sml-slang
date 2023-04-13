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
 * LIST INSTANTIATION []
 */
describe('list creation with []', () => {
  test('nested empty lists', () => {
    const code: string = '[[[]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list', 'list'],
        value: [[[]]]
      })
    })
  })

  test('literals of same types', () => {
    const code: string = '[1, 2, 3];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list'],
        value: [1, 2, 3]
      })
    })
  })

  test('literals of different types', () => {
    const code: string = '[1, true, 3];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "bool * int".'
      )
    })
  })

  test('nested lists of same type', () => {
    const code: string = '[[1], [2], [3]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list'],
        value: [[1], [2], [3]]
      })
    })
  })

  test('nested lists of different type', () => {
    const code: string = '[[1], ["hello"], [3]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "string list * int list list".'
      )
    })
  })

  test('free lists of different levels of nesting', () => {
    const code: string = '[[[[]]], [], [[]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list', 'list', 'list'],
        value: [[[[]]], [], [[]]]
      })
    })
  })

  test('non-free list with free list elems of different levels of nesting', () => {
    const code: string = '[[], [[]], [[1]], [], [[]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list', 'list'],
        value: [[], [[]], [[1]], [], [[]]]
      })
    })
  })

  test('free list fails with int list elem of lesser nesting', () => {
    const code: string = '[[[]], [1]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "\'a list list * int list list".'
      )
    })
  })

  test('non-free list fails with free list elem of larger nesting', () => {
    const code: string = '[[], [1], [[]]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "int list * \'a list list list".'
      )
    })
  })
})

/**
 * LIST CONSTRUCT WITH :: AND nil
 */
describe('list construction with :: and nil', () => {
  test('simple list with only literals, ends with nil', () => {
    const code: string = '1::2::3::4::5::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list'],
        value: [1, 2, 3, 4, 5]
      })
    })
  })

  test('simple list with only literals, ends with list', () => {
    const code: string = '1::2::3::[4,5];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list'],
        value: [1, 2, 3, 4, 5]
      })
    })
  })

  test('RHS is not nil or list', () => {
    const code: string = '4::5;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "int * int".'
      )
    })
  })

  test('list of different types', () => {
    const code: string = '1::true::5::nil;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "bool * int list".'
      )
    })
  })

  test('nested list creation with ::', () => {
    const code: string = '(1::3::nil)::[5::[7]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list'],
        value: [
          [1, 3],
          [5, 7]
        ]
      })
    })
  })

  test('operator precedence maintains', () => {
    const code: string = '(true::(1+2=2)::nil)::[2 + 3 > 6]::[[true]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['bool', 'list', 'list'],
        value: [[true, false], [false], [true]]
      })
    })
  })

  test('nil chain', () => {
    const code: string = 'nil::nil::nil::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list'],
        value: [[], [], []]
      })
    })
  })

  test('nil with free list', () => {
    const code: string = '(nil::nil)::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list', 'list'],
        value: [[[]]]
      })
    })
  })

  test('free list of different levels of nesting', () => {
    const code: string = '((nil::nil)::nil)::nil::(nil::nil)::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list', 'list', 'list'],
        value: [[[[]]], [], [[]]]
      })
    })
  })
})

/**
 * LIST APPEND @
 */
describe('list append with @', () => {
  test('append only simple lists', () => {
    const code: string = '[1]@[2]@[3];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list'],
        value: [1, 2, 3]
      })
    })
  })

  test('append nested lists', () => {
    const code: string = '[[1]]@([2::nil])@[[3]@[4]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list'],
        value: [[1], [2], [3, 4]]
      })
    })
  })

  test('append with free lists', () => {
    const code: string = '[]@[[1], [2]]@nil@[[2], [3]]@[[]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list'],
        value: [[1], [2], [2], [3], []]
      })
    })
  })

  test('append only free lists', () => {
    const code: string = '[[]]@[]@[[[]]]@[[[[]]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["'a", 'list', 'list', 'list', 'list'],
        value: [[], [[]], [[[]]]]
      })
    })
  })

  test('append list of different types', () => {
    const code: string = '[1]@[2]@[true];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "int list * bool list".'
      )
    })
  })

  test('append a free list that has a deeper nesting to another list ', () => {
    const code: string = '[1]@[[]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "int list * \'a list list".'
      )
    })
  })

  test('append a non-list element', () => {
    const code: string = '[1]@2;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "int list * int".'
      )
    })
  })

  test('append a non-free list of lesser level of nesting to a free list', () => {
    const code: string = '[[]]@[1];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "\'a * \'a list -> \'a list" cannot take in an argument of type "\'a list list * int list".'
      )
    })
  })
})

// LIST OPERATOR PRECEDENCE

describe('list operator precedence', () => {
  test('left associative basic', () => {
    const code: string = 'val x = [2]@3::[1];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list'],
        value: [2, 3, 1]
      })
    })
  })

  test('left associative complex', () => {
    const code: string = 'val x = [[(1, 2)]::[[(3, 4)]], [[(5, 6)]]@[(7, 8)]::nil];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: [['int', 'int', 'tuple'], 'list', 'list', 'list'],
        value: [[[[1, 2]], [[3, 4]]], [[[5, 6]], [[7, 8]]]]
      })
    })
  })
})
