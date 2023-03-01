import { createContext, IOptions, runInContext } from "../src";
import { Finished, Variant } from "../src/types";

const context = createContext(Variant.DEFAULT, undefined, undefined)
const options: Partial<IOptions> = {
    scheduler: 'preemptive',
    executionMethod: 'interpreter',
    variant: Variant.DEFAULT,
    useSubst: false
}

describe ('testing', () => {
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
})