import { createContext, IOptions, runInContext } from '..'
import { Finished, Variant } from '../types'

const context = createContext(Variant.DEFAULT, undefined, undefined)
const options: Partial<IOptions> = {
  scheduler: 'preemptive',
  executionMethod: 'interpreter',
  variant: Variant.DEFAULT,
  useSubst: false
}

describe('literals', () => {
  test('Number literal expression', () => {
    const code: string = '5;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(5)
    })
  })

  test('Boolean literal expression', () => {
    const code: string = 'true;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(true)
    })
  })

  test('String literal expression', () => {
    const code: string = '"test string";'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('test string')
    })
  })

  test('String of boolean keyword', () => {
    const code: string = 'val bool = "true";'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('true')
    })
  })

  test('String of numbers', () => {
    const code: string = 'val num = "947563";'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('947563')
    })
  })

  test('String of nil', () => {
    const code: string = 'val n = "nil";'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('nil')
    })
  })
})

describe('unop expressions', () => {
  test('negation', () => {
    const code: string = 'val num = 234; ~num;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(-234)
    })
  })

  test('not', () => {
    const code: string = 'val bool = true; not bool;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(false)
    })
  })
})

describe('binop', () => {
  test('minus', () => {
    const code: string = '3 - 4;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(-1)
    })
  })

  test('plus', () => {
    const code: string = '~1 + 90;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(89)
    })
  })

  test('divide', () => {
    const code: string = '20 div 3;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(6)
    })
  })

  test('multiply', () => {
    const code: string = '3 * 5;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(15)
    })
  })

  test('concat', () => {
    const code: string = '"hello" ^ " world";'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('hello world')
    })
  })

  test('modulo', () => {
    const code: string = '10 mod 3;'
    runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(1)
    })
  })

  describe('equals', () => {
    test('same number', () => {
      const code: string = '234 = 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('same string', () => {
      const code: string = '"abcd" = "abcd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('same boolean', () => {
      const code: string = 'false = false;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff number', () => {
      const code: string = '234 = 230;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff string', () => {
      const code: string = '"abcd" = "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff boolean', () => {
      const code: string = 'true = false;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff types', () => {
      const code: string = '"234" = 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })

  describe('not equals', () => {
    test('same number', () => {
      const code: string = '234 <> 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('same string', () => {
      const code: string = '"abcd" <> "abcd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('same boolean', () => {
      const code: string = 'false <> false;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff number', () => {
      const code: string = '234 <> 230;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff string', () => {
      const code: string = '"abcd" <> "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff boolean', () => {
      const code: string = 'true <> false;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff types', () => {
      const code: string = '"234" <> 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })

  describe('greater than', () => {
    test('compare numbers', () => {
      const code: string = '234 > 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" > "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })

  describe('greater than or equal', () => {
    test('compare numbers', () => {
      const code: string = '234 >= 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" >= "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })

  describe('smaller than', () => {
    test('compare numbers', () => {
      const code: string = '233 < 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" < "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })

  describe('smaller than or equal', () => {
    test('compare numbers', () => {
      const code: string = '233 <= 234;'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" <= "aacd";'
      runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })
})
