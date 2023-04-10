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
 * VAL DECLARATIONS - NO ANNOTATIONS
 */
describe('val declarations with no annotations', () => {
  test('simple val dec', () => {
    const code: string = 'val x = 3; x;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 3
      })
    })
  })

  test('list val dec', () => {
    const code: string = 'val x = [[1]]; x;'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ['int', 'list', 'list'],
        value: [[1]]
      })
    })
  })

  test('valid binop using variables', () => {
    const code: string = `
        val x = 3;
        val y = 4;
        val add = ~x + y;
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 1
      })
    })
  })

  test('invalid binop using variables', () => {
    const code: string = `
        val x = true;
        val y = 4;
        val added = y + 5;
        val add = x + added;
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "int * int -> int" cannot take in an argument of type "bool * int".'
      )
    })
  })

  test('invalid binop using variables and literals', () => {
    const code: string = `
        val x = true;
        val add = 1 + 2 + x + 3 + 4;
    `
    return runInContext(code, context, options).catch(error => {
      expect(error.explain()).toMatch(
        'Functions of type "int * int -> int" cannot take in an argument of type "int * bool".'
      )
    })
  })

  test('function parameters inferred from body binop', () => {
    const code: string = `
        val x = fn y => y > 1;
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual(['int', 'bool', 'fun'])
    })
  })

  test('function parameters inferred from body unop', () => {
    const code: string = `
        val x = fn y => not y;
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual(['bool', 'bool', 'fun'])
    })
  })

  test('function parameters inferred from body fun app', () => {
    const code: string = `
        val x = fn y => y(true) + 1;
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual([['bool', 'int', 'fun'], 'int', 'fun'])
    })
  })

  test('nested function', () => {
    const code: string = `
        val a = fn x => x + 1; 
        fun test x = fn y => y(a) > x(1);
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual([
        ['int', 'int', 'fun'],
        [[['int', 'int', 'fun'], 'int', 'fun'], 'bool', 'fun'], 
        'fun'
      ])
    })
  })

  test('infer type from conditional expr', () => {
    const code: string = `
        val a = 4; 
        val b = 10;   
        val x = if true then a else b; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual('int')
    })
  })

  test('infer type from let expr', () => {
    const code: string = `
        val x = 
        let 
          val y = 2; 
          val z = 3; 
          val a = fn (x, y) => x > y; 
        in 
          a(y, z);
        end; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual('bool')
    })
  })

  test('infer type with local', () => {
    const code: string = `
        local 
          val x = 5; 
          val y = "hello"; 
          val z = fn x => x > 10; 
        in 
          val a = z(x); 
          val b = if (a) then y else "world"; 
        end; 
        val c = b;
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual('string')
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
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 200
      })
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
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 200
      })
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
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 200
      })
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
      expect((data as Finished).value).toStrictEqual({
        type: 'int',
        value: 199
      })
    })
  })
})