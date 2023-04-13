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
 * TYPE ANNOTATIONS
 */

describe('type annotations', () => {
    test('annotation matches value assigned', () => {
      const code: string = 'val x : int = 4'
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: 'int',
          value: 4
        })
      })
    })
  
    test('annotation does not match value assigned', () => {
      const code: string = 'val x : int = true'
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "int" does not match expression\'s type "bool".'
        )
      })
    })
  
    test('fun dec return type does not match', () => {
      const code: string = `
        fun test (x : int) : int = x > 6;
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "int -> int" does not match expression\'s type "int -> bool".'
        )
      })
    })
  
    test('fun dec arg type does not match', () => {
      const code: string = `
        fun test (x : int) : int = x + 6; test(true);
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "int" does not match expression\'s type "bool".'
        )
      })
    })
  
    test('lambda return type does not match', () => {
      const code: string = `
        val test : bool -> bool = fn (x : bool) => if x then 4 else 5;
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "bool -> bool" does not match expression\'s type "bool -> int".'
        )
      })
    })
  
    test('lambda param type does not match', () => {
      const code: string = `
        val test : int -> bool = fn (x : bool) => if x then 4 else 5;
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "int -> bool" does not match expression\'s type "bool -> int".'
        )
      })
    })
  
    test('lambda multiple params type does not match', () => {
      const code: string = `
        (fn (x : int, y: int, z: int) => x + y + z)(1, 2);
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "(int * int * int)" does not match expression\'s type "(int * int)".'
        )
      })
    })
  
    test('func application type does not match', () => {
      const code: string = `
        val test : bool = (fn (x : int, y: int, z: int) => x + y + z)(1, 2, 3);
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "bool" does not match expression\'s type "int".'
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
        expect((data as Finished).value).toStrictEqual({
          type: 'bool',
          value: true
        })
      })
    })
  
    test('nested types lambda', () => {
      const code: string = `
        val a : int -> int = fn (x: int) => x + 1;
        val test : int -> int -> (int -> bool) = fn (x: int -> int) => fn (y : int) => y > x(1);
        test(a) (5);
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: 'bool',
          value: true
        })
      })
    })
  
    test('tuple types', () => {
      const code: string = `
        val x : (int * int * int) = (1,2,3);
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: ['int', 'int', 'int', 'tuple'],
          value: [1, 2, 3]
        })
      })
    })
  
    test('nested tuple types', () => {
      const code: string = `
        val x : ((int * int) * int) = ((1,2),3);
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: [['int', 'int', 'tuple'], 'int', 'tuple'],
          value: [[1, 2], 3]
        })
      })
    })
  
    test('mismatch tuple types should throw error', () => {
      const code: string = `
        val x : ((int * bool) * bool) = ((1,true),3);
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "((int * bool) * bool)" does not match expression\'s type "((int * bool) * int)".'
        )
      })
    })
  
    test('list types', () => {
      const code: string = `
        val x : int list = [1,2,3];
        val y : bool list = [true, false, true];
        val z : string list = ["hello", "bye"];
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: ['string', 'list'],
          value: ['hello', 'bye']
        })
      })
    })
  
    test('nested list types', () => {
      const code: string = `
        val x : (int list list * bool list) list = [([[1], [2]], [true]), ([[3]], [false, true])];
        val y : bool list list = [[true], [false], [true]];
        val z : int list list list = [[[1], [2]]];
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: ['int', 'list', 'list', 'list'],
          value: [[[1], [2]]]
        })
      })
    })
  
    test('mismatch list types should throw error', () => {
      const code: string = `
      val x : (int list * bool list) list = [([[1], [2]], [true]), ([[3]], [false, true])];
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'The annotated type "(int list * bool list) list" does not match expression\'s type "(int list list * bool list) list".'
        )
      })
    })
  
    test('mismatch conditional branch types', () => {
      const code: string = `
        val a : int = 4;
        val b = true;
        val c : string = "hello";
        val result : string = if (b) then c else a;
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch(
          'Match rules disagree on type: Cannot merge "string" and "int".'
        )
      })
    })
  
    test('mismatch conditional pred type', () => {
      const code: string = `
        fun test (x : int) : int =
          if (x)
          then 1
          else 2;
      `
      return runInContext(code, context, options).catch(error => {
        expect(error.explain()).toMatch('Expected predicate of type "bool", got "int".')
      })
    })
  
    test('type subsets', () => {
      const code: string = `
        val x : int list = [];
        val y : int list list = [[]];
        val z : int list = if true then [] else [1,2];
        val a : int list = z;
      `
      return runInContext(code, context, options).then(data => {
        expect((data as Finished).value).toStrictEqual({
          type: ["'a", 'list'],
          value: []
        })
      })
    })
  })
  
/**
 * TYPE INFERENCE
 */
describe('type inference', () => {
  test('function type inference', () => {
    const code: string = 'fun test x = x + 1'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual(["int", "int", "fun"])
    })
  })

  test('function call type inference', () => {
    const code: string = 'fun test x = x(1) + 1'
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual([["int", "int", "fun"], "int", "fun"])
    })
  })

  test('type inference from variable', () => {
    const code: string = `
      val x = 1;
      val a = 2;  
      val y = true; 
      val z = if y then x else a; 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual("int")
    })
  })

  // parametric polymorphism

  test('function should take in args of more than one type', () => {
    const code: string = `
      fun test x = 1;
      (test(1), test(true), test("hello"))
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value.type).toStrictEqual(["int", "int", "int", "tuple"])
    })
  })

  test('identity function', () => {
    const code: string = `
      val x = fn y => y; 
      (x(1), x(true)); 
    `
    return runInContext(code, context, options).then(data => {
      expect((data as Finished).value).toStrictEqual({
        type: ["int", "bool", "tuple"], 
        value: [1, true]
      })
    })
  })
})
