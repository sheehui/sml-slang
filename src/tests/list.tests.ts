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
      expect((data as Finished).value).toStrictEqual([[[]]])
    })
  })

  test('literals of same types', () => {
    const code: string = '[1, 2, 3];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([1, 2, 3])
    })
  })

  test('literals of different types', () => {
    const code: string = '[1, true, 3];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected int or its subset, got boolean.')
    })
  })

  test('nested lists of same type', () => {
    const code: string = '[[1], [2], [3]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[1], [2], [3]])
    })
  })

  test('nested lists of different type', () => {
    const code: string = '[[1], ["hello"], [3]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected int list or its subset, got string list.')
    })
  })

  test('free lists of different levels of nesting', () => {
    const code: string = '[[[[]]], [], [[]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[[[]]], [], [[]]])
    })
  })

  test('non-free list with free list elems of different levels of nesting', () => {
    const code: string = '[[], [[]], [[1]], [], [[]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[], [[]], [[1]], [], [[]]])
    })
  })

  test('free list fails with int list elem of lesser nesting', () => {
    const code: string = '[[[]], [1]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("Expected 'a list list or its subset, got int list.")
    })
  })

  test('non-free list fails with free list elem of larger nesting', () => {
    const code: string = '[[], [1], [[]]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch("Expected int list or its subset, got 'a list list.")
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
      expect((data as Finished).value).toStrictEqual([1, 2, 3, 4, 5])
    })
  })

  test('simple list with only literals, ends with list', () => {
    const code: string = '1::2::3::[4,5];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([1, 2, 3, 4, 5])
    })
  })

  test('RHS is not nil or list', () => {
    const code: string = '4::5;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected list on right hand side of operation, got int.')
    })
  })

  test('list of different types', () => {
    const code: string = '1::true::5::nil;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected int on left hand side of operation, got boolean.')
    })
  })

  test('nested list creation with ::', () => {
    const code: string = '(1::3::nil)::[5::[7]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([
        [1, 3],
        [5, 7]
      ])
    })
  })

  test('operator precedence maintains', () => {
    const code: string = '(true::(1+2=2)::nil)::[2 + 3 > 6]::[[true]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[true, false], [false], [true]])
    })
  })

  test('nil chain', () => {
    const code: string = 'nil::nil::nil::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[], [], []])
    })
  })

  test('nil with free list', () => {
    const code: string = '(nil::nil)::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[[]]])
    })
  })

  test('free list of different levels of nesting', () => {
    const code: string = '((nil::nil)::nil)::nil::(nil::nil)::nil;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[[[]]], [], [[]]])
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
      expect((data as Finished).value).toStrictEqual([1, 2, 3])
    })
  })

  test('append nested lists', () => {
    const code: string = '[[1]]@([2::nil])@[[3]@[4]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[1], [2], [3, 4]])
    })
  })

  test('append with free lists', () => {
    const code: string = '[]@[[1], [2]]@nil@[[2], [3]]@[[]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[1], [2], [2], [3], []])
    })
  })

  test('append only free lists', () => {
    const code: string = '[[]]@[]@[[[]]]@[[[[]]]];'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual([[], [[]], [[[]]]])
    })
  })

  test('append list of different types', () => {
    const code: string = '[1]@[2]@[true];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected int list on right hand side of @, got boolean list.'
      )
    })
  })

  test('append a free list that has a deeper nesting to another list ', () => {
    const code: string = '[1]@[[]];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        "Expected int list on right hand side of @, got 'a list list."
      )
    })
  })

  test('append a non-list element', () => {
    const code: string = '[1]@2;'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected list on right hand side of @, got int.')
    })
  })

  test('append a non-free list of lesser level of nesting to a free list', () => {
    const code: string = '[[]]@[1];'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        "Expected 'a list list or its superset on right hand side of @, got int list."
      )
    })
  })
})
