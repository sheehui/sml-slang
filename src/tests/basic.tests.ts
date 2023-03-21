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
 * FUNCTION DECLARATIONS
 */
describe('fun declaration', () => {
  test('basic fun declaration', () => {
    const code: string = 'fun test (x: int) : int = x + 1; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test('fun declaration with let expr', () => {
    const code: string = 'fun test (x : int) : int = let val y : int = 2; in x + y; end; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('fun declaration with nested fun declaration', () => {
    const code: string =
      'fun test (x: int) : int = let fun test2 (y : int) : int = y + x; in test2(2); end; test(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('unbound variable in fun declaration', () => {
    const code: string = 'fun test (x : int) : int = x + y;'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable y')
    })
  })

  test('unbound variable in nested fun declaration', () => {
    const code: string =
      'fun test (x : int) : int = let fun test2 (y: int) : int = y + x + z; in test2(2); end; test(1);'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable z')
    })
  })

  test('fun declaration supports recursive call', () => {
    const code: string = 'fun test (x : int) : int = if x > 0 then test(x - 1) else 10; test(3);'
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
    const code: string = '(fn (x : int) => x + 1)(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test('lambda with multiple params', () => {
    const code: string = '(fn (x : int, y: int, z: int) => x + y + z)(1, 2, 3);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(6)
    })
  })

  test('lambda with let expr', () => {
    const code: string = '(fn (x : int) => let val y : int = 2; in x + y; end)(1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('lambda with nested lambda', () => {
    const code: string = '(fn (x : int) => (fn (y : int)=> y + x)(2)) (1);'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('unbound variable in lambda', () => {
    const code: string = 'fn (x : int) => x + y;'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable y')
    })
  })

  test('unbound variable in nested lambda', () => {
    const code: string = '(fn (x : int) => (fn (y : int) => y + x + z)(2)) (1);'
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable z')
    })
  })

  test('lambda variable declaration', () => {
    const code: string =
      'val test : int -> int = fn (x : int) => (fn (y : int) => y + x)(2); test(1)'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(3)
    })
  })

  test('lambda variable declaration does not support recursive call', () => {
    const code: string = `val test : int -> int = fn (x : int) => 
                            if x > 0 
                              then test(x - 1) 
                              else 10; 
                          test(3);`
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable test')
    })
  })
})

/**
 * RECURSIVE DECLARATIONS
 */
describe('val rec', () => {
  test("recursive declaration without 'rec' is not allowed", () => {
    const code: string = `val test : int -> int = fn (x : int) => 
                            if (x > 0) 
                              then test(x - 1)
                              else 200; 
                          test(3);`
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable test')
    })
  })

  test("recursive declaration with 'rec' is allowed", () => {
    const code: string = `val rec test : int -> int = fn (x : int) => 
                            if (x > 0) 
                              then test(x - 1)
                              else 200; 
                          test(3);`
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(200)
    })
  })

  test('within local declaration', () => {
    const code: string = `
                          let 
                            val rec test : int -> int = fn (x : int) => 
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

  test('within fun declaration', () => {
    const code: string = `
                          fun hello (y : int) : int = 
                            let 
                              val rec test : int -> int = fn (x : int) => 
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

  test('within rec lambda', () => {
    const code: string = `
                          val rec hello : int -> int = fn (y : int) => 
                            let 
                              val rec test : int -> int = fn (x : int) => 
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
  test('local with var dec', () => {
    const code: string = `
      local 
        val x : int = 1; 
      in 
        val y : int = x + 1; 
      end; 
      y; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(2)
    })
  })

  test('local with fun', () => {
    const code: string = `
      local 
        val x : int = 1;
        fun z (n: int) : int = n + 3; 
      in 
        fun test (n : int) : int = n + x + z(x)
      end; 
      test(5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test('local with var lambda', () => {
    const code: string = `
      local 
        val x : int = 1;
        val z : int -> int = fn (n : int) => n + 3; 
      in 
        val test : int -> int = fn (n : int) => n + x + z(x)
      end; 
      test(5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test('local with recursive', () => {
    const code: string = `
      local 
        val rec test : int -> int = fn (x : int) => 
        if (x > 0) 
          then test(x - 1)
          else 200;
      in 
        val x : int = test(3) + 1; 
      end; 
      x; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(201)
    })
  })

  test('local with multiple dec', () => {
    const code: string = `
      local 
        val x : int = 1;
        val y : int = 2; 
        val z : int -> int = fn (n : int) => n + 3; 
      in 
        val a : int = x + y; 
        val b : int = z(y); 
        fun c (n : int) : int = n + a + b; 
      end; 
      c(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })

  test('local decs can access vars outside block', () => {
    const code: string = `
      val x : int = 1; 
      val y : int = 2; 
      local 
        val z : int -> int = fn (n : int) => n + 3 + x; 
      in 
        val a : int = x + y; 
        val b : int = z(y); 
        fun c (n : int) : int = n + a + b; 
      end; 
      c(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(11)
    })
  })

  test('local decs should override vars outside block', () => {
    const code: string = `
      val x : int = 1; 
      val y : int = 2; 
      local 
        val x : int = 11; 
        val y : int = 22; 
      in 
        val z : int = x + y; 
      end; 
      z; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(33)
    })
  })

  test('local decs are inaccessible outside of the block', () => {
    const code: string = `
      local 
        val x : int = 1; 
      in 
        val y : int = x + 1; 
      end; 
      x; 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.message).toMatch('Unbound variable x')
    })
  })

  test('nested local declarations', () => {
    const code: string = `
      local 
        local
          val x : int = 1;  
        in
          val y : int -> int = fn (n: int) => x + n; 
        end; 
        val z : int = y(1);  
      in 
        local 
          val a : int = z + 3;
        in 
          fun b (n: int) : int = a * n; 
        end; 
      end; 
      b(2); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toBe(10)
    })
  })
})

/**
 * TYPE ANNOTATIONS
 */

describe('type annotations', () => {
  test('annotation matches value assigned', () => {
    const code: string = 'val x : int = 4'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual(4)
    })
  })

  test('annotation does not match value assigned', () => {
    const code: string = 'val x : int = true'
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected int as assigned value, got boolean.')
    })
  })

  test('value assigned is computed', () => {
    const code: string = `
      val a : int = 4; 
      val b = true; 
      val c : string = "hello"; 
      val result : string = if (b) then c else a; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual('hello')
    })
  })

  test('fun dec return type does not match', () => {
    const code: string = `
      fun test (x : int) : int = x > 6; 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected int -> int as assigned value, got int -> boolean.'
      )
    })
  })

  test('fun dec arg type does not match', () => {
    const code: string = `
      fun test (x : int) : int = x + 6; test(true);
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch('Expected int as argument to function, got boolean.')
    })
  })

  test('lambda return type does not match', () => {
    const code: string = `
      val test : bool -> bool = fn (x : bool) => if x then 4 else 5; 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected boolean -> boolean as assigned value, got boolean -> int.'
      )
    })
  })

  test('lambda param type does not match', () => {
    const code: string = `
      val test : int -> bool = fn (x : bool) => if x then 4 else 5; 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected int -> boolean as assigned value, got boolean -> int.'
      )
    })
  })

  test('lambda multiple params type does not match', () => {
    const code: string = `
      (fn (x : int, y: int, z: int) => x + y + z)(1, 2); 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected int * int * int as argument to function, got int * int.'
      )
    })
  })

  test('func application type does not match', () => {
    const code: string = `
      val test : bool = (fn (x : int, y: int, z: int) => x + y + z)(1, 2, 3); 
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Expected boolean as assigned value, got int.'
      )
    })
  })

  test('nested types', () => {
    const code: string = `
      val a : int -> int = fn (x: int) => x + 1; 
      fun test (x: int -> int) : int -> bool = fn (y : int) => y > x(1);
      test(a) (5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual(true)
    })
  })

  test('nested types lambda', () => {
    const code: string = `
      val a : int -> int = fn (x: int) => x + 1; 
      val test : int -> int -> (int -> bool) = fn (x: int -> int) => fn (y : int) => y > x(1); 
      test(a) (5); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual(true)
    })
  })
})
