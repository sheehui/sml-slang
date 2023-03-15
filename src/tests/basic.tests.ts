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
 * LITERALS
 */
describe('literals', () => {
  test('Number literal expression', () => {
    const code: string = '5;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(5)
    })
  })

  test('Boolean literal expression', () => {
    const code: string = 'true;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(true)
    })
  })

  test('String literal expression', () => {
    const code: string = '"test string";'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('test string')
    })
  })

  test('String of boolean keyword', () => {
    const code: string = 'val bool = "true";'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('true')
    })
  })

  test('String of numbers', () => {
    const code: string = 'val num = "947563";'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('947563')
    })
  })

  test('String of nil', () => {
    const code: string = 'val n = "nil";'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('nil')
    })
  })
})

/**
 * UNARY OPERATIONS
 */
describe('unop expressions', () => {
  test('negation', () => {
    const code: string = 'val num = 234; ~num;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(-234)
    })
  })

  test('not', () => {
    const code: string = 'val bool = true; not bool;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(false)
    })
  })
})

/**
 * BINARY OPERATIONS
 */
describe('binop', () => {
  test('minus', () => {
    const code: string = '3 - 4;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(-1)
    })
  })

  test('plus', () => {
    const code: string = '~1 + 90;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(89)
    })
  })

  test('divide', () => {
    const code: string = '20 div 3;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(6)
    })
  })

  test('multiply', () => {
    const code: string = '3 * 5;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(15)
    })
  })

  test('concat', () => {
    const code: string = '"hello" ^ " world";'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe('hello world')
    })
  })

  test('modulo', () => {
    const code: string = '10 mod 3;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(1)
    })
  })

  describe('equals', () => {
    test('same number', () => {
      const code: string = '234 = 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('same string', () => {
      const code: string = '"abcd" = "abcd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('same boolean', () => {
      const code: string = 'false = false;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff number', () => {
      const code: string = '234 = 230;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff string', () => {
      const code: string = '"abcd" = "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff boolean', () => {
      const code: string = 'true = false;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff types', () => {
      const code: string = '"234" = 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })

  describe('not equals', () => {
    test('same number', () => {
      const code: string = '234 <> 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('same string', () => {
      const code: string = '"abcd" <> "abcd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('same boolean', () => {
      const code: string = 'false <> false;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('diff number', () => {
      const code: string = '234 <> 230;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff string', () => {
      const code: string = '"abcd" <> "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff boolean', () => {
      const code: string = 'true <> false;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('diff types', () => {
      const code: string = '"234" <> 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })

  describe('greater than', () => {
    test('compare numbers', () => {
      const code: string = '234 > 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" > "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })

  describe('greater than or equal', () => {
    test('compare numbers', () => {
      const code: string = '234 >= 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" >= "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })
  })

  describe('smaller than', () => {
    test('compare numbers', () => {
      const code: string = '233 < 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" < "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })

  describe('smaller than or equal', () => {
    test('compare numbers', () => {
      const code: string = '233 <= 234;'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(true)
      })
    })

    test('compare strings', () => {
      const code: string = '"abcd" <= "aacd";'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toBe(false)
      })
    })
  })
})

/**
 * LIST INSTANTIATION
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
      expect(error.explain()).toMatch("Expected int as list element, got boolean")
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
      expect(error.explain()).toMatch("Expected int list as list element, got string list")
    })
  })
})

/**
 * FUNCTION DECLARATIONS
 */
describe('fun declaration', () => {
  test('basic fun declaration', () => {
    const code: string = 'fun test x = x + 1; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test('fun declaration with let expr', () => {
    const code: string = 'fun test x = let val y = 2; in x + y; end; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('fun declaration with nested fun declaration', () => {
    const code: string = 'fun test x = let fun test2 y = y + x; in test2(2); end; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('unbound variable in fun declaration', () => {
    const code: string = 'fun test x = x + y;'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable y")
    })
  })

  test('unbound variable in nested fun declaration', () => {
    const code: string = 'fun test x = let fun test2 y = y + x + z; in test2(2); end; test(1);'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable z")
    })
  })

  test('fun declaration supports recursive call', () => {
    const code: string = 'fun test x = if x > 0 then test(x - 1) else 10; test(3);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })
})

/**
 * LAMBDAS
 */
describe('lambdas', () => {
  test('basic lambda', () => {
    const code: string = '(fn x => x + 1)(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test('lambda with multiple params', () => {
    const code: string = '(fn (x, y, z) => x + y + z)(1, 2, 3);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(6)
    })
  })

  test('lambda with let expr', () => {
    const code: string = '(fn x => let val y = 2; in x + y; end)(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('lambda with nested lambda', () => {
    const code: string = '(fn x => (fn y => y + x)(2)) (1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('unbound variable in lambda', () => {
    const code: string = 'fn x => x + y;'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable y")
    })
  })

  test('unbound variable in nested lambda', () => {
    const code: string = '(fn x => (fn y => y + x + z)(2)) (1);'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable z")
    })
  })

  test('lambda variable declaration', () => {
    const code: string = 'val test = fn x => (fn y => y + x)(2); test(1)'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('lambda variable declaration does not support recursive call', () => {
    const code: string = `val test = fn x => 
                            if x > 0 
                              then test(x - 1) 
                              else 10; 
                          test(3);`
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable test")
    })
  })
})

/**
 * RECURSIVE DECLARATIONS
 */
describe('val rec', () => {
  test("recursive declaration without 'rec' is not allowed", () => {
    const code: string = `val test = fn x => 
                            if (x > 0) 
                              then test(x - 1)
                              else 200; 
                          test(3);`
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable test")
    })
  })

  test("recursive declaration with 'rec' is allowed", () => {
    const code: string = `val rec test = fn x => 
                            if (x > 0) 
                              then test(x - 1)
                              else 200; 
                          test(3);`
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(200)
    })
  })

  test("within local declaration", () => {
    const code : string = `
                          let 
                            val rec test = fn x => 
                            if (x > 0) 
                              then test(x - 1)
                              else 200; 
                          in
                            test(3);
                          end;`
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(200)
    })
  })

  test("within fun declaration", () => {
    const code : string = `
                          fun hello y = 
                            let 
                              val rec test = fn x => 
                              if (x > 0) 
                                then test(x - 1)
                                else 200; 
                            in
                              test(y);
                            end; 
                          hello(7);`
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(200)
    })
  })

  test("within rec lambda", () => {
    const code : string = `
                          val rec hello = fn y => 
                            let 
                              val rec test = fn x => 
                              if (x > 0) 
                                then test(x - 1)
                                else 200; 
                            in
                              if (test(y) = 200) then 199 else hello(y);
                            end; 
                          hello(7);`
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(199)
    })
  })

})

/**
 * LOCAL
 */
describe('local', () => {
  test("local with var dec", () => {
    const code : string = `
      local 
        val x = 1; 
      in 
        val y = x + 1; 
      end; 
      y; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test("local with fun", () => {
    const code : string = `
      local 
        val x = 1;
        fun z n = n + 3; 
      in 
        fun test n = n + x + z(x)
      end; 
      test(5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test("local with var lambda", () => {
    const code : string = `
      local 
        val x = 1;
        val z = fn n => n + 3; 
      in 
        val test = fn n => n + x + z(x)
      end; 
      test(5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test("local with recursive", () => {
    const code : string = `
      local 
        val rec test = fn x => 
        if (x > 0) 
          then test(x - 1)
          else 200;
      in 
        val x = test(3) + 1; 
      end; 
      x; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(201)
    })
  })

  test("local with multiple dec", () => {
    const code : string = `
      local 
        val x = 1;
        val y = 2; 
        val z = fn n => n + 3; 
      in 
        val a = x + y; 
        val b = z(y); 
        fun c n = n + a + b; 
      end; 
      c(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test("local decs can access vars outside block", () => {
    const code : string = `
      val x = 1; 
      val y = 2; 
      local 
        val z = fn n => n + 3 + x; 
      in 
        val a = x + y; 
        val b = z(y); 
        fun c n = n + a + b; 
      end; 
      c(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(11)
    })
  })

  test("local decs should override vars outside block", () => {
    const code : string = `
      val x = 1; 
      val y = 2; 
      local 
        val x = 11; 
        val y = 22; 
      in 
        val z = x + y; 
      end; 
      z; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(33)
    })
  })

  test("local decs are inaccessible outside of the block", () => {
    const code : string = `
      local 
        val x = 1; 
      in 
        val y = x + 1; 
      end; 
      x; 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch("Unbound variable x")
    })
  })

  test("nested local declarations", () => {
    const code : string = `
      local 
        local
          val x = 1;  
        in
          val y = fn n => x + n; 
        end; 
        val z = y(1);  
      in 
        local 
          val a = z + 3;
        in 
          fun b n = a * n; 
        end; 
      end; 
      b(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })
})