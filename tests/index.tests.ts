import { createContext, IOptions, runInContext } from "../src";
import { Finished, Variant } from "../src/types";

const context = createContext(Variant.DEFAULT, undefined, undefined)
const options: Partial<IOptions> = {
    scheduler: 'preemptive',
    executionMethod: 'interpreter',
    variant: Variant.DEFAULT,
    useSubst: false
}

describe ('literals', () => {
    test('Number literal expression', () => {
        const code : string = "5;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(5)
        }); 
    })

    test('Boolean literal expression', () => {
        const code : string = "true;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(true)
        }); 
    })

    test('String literal expression', () => {
        const code : string = "\"test string\";"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe("test string")
        }); 
    })

    test('String of boolean keyword', () => {
        const code : string = "val bool = \"true\";"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe("true")
        }); 
    })

    test('String of numbers', () => {
        const code : string = "val num = \"947563\";"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe("947563")
        }); 
    })

    test('String of nil', () => {
        const code : string = "val n = \"nil\";"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe("nil")
        }); 
    })
})

describe('unop expressions', () => {
    test('negation', () => {
        const code : string = "val num = 234; ~num;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(-234)
        }); 
    })

    test('not', () => {
        const code : string = "val bool = true; not bool;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(false)
        }); 
    })
})

describe('binop', () => {
    test('minus', () => {
        const code : string = "3 - 4;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(-1)
        }); 
    })

    test('plus', () => {
        const code : string = "~1 + 90;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(89)
        }); 
    })

    test('divide', () => {
        const code : string = "20 div 3;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(6)
        }); 
    })

    test('multiply', () => {
        const code : string = "3 * 5;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(15)
        }); 
    })

    test('concat', () => {
        const code : string = "\"hello\" ^ \" world\";"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe("hello world")
        }); 
    })

    test('modulo', () => {
        const code : string = "10 mod 3;"
        return runInContext(code, context, options).then(data => {
            expect((data as Finished).value).toBe(1)
        }); 
    })
})