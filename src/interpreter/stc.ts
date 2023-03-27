import { SmlType } from "../types"

export interface TypeEnv {
    tail: TypeEnv | null
    head: TypeFrame
}

export interface TypeFrame {
    [name: string]: SmlType
}

export let typeEnv : TypeEnv = {
    head: {}, 
    tail: null
}

export const resetTypeEnv = () => {
    typeEnv = {
        head: {}, 
        tail: null 
    }
}

export const getTypeEnv = () : TypeEnv => {
    return typeEnv 
}

export const extendTypeEnv = (vars: string[], types: SmlType[]) : TypeEnv => {
    const newFrame = {}
    for (let i = 0; i < vars.length; i++) {
        newFrame[vars[i]] = types[i] 
    }
    typeEnv = {
        tail: typeEnv, 
        head: newFrame
    }
    return typeEnv
}

export const addToFrame = (vars: string, type: SmlType) => {
    typeEnv.head[vars] = type 
}

export const restoreTypeEnv = (env: TypeEnv) => {
    typeEnv = env 
}

export const findTypeInEnv = (vars: string) : SmlType => {
    let env: TypeEnv | null = typeEnv
    while (env) {
      const frame : TypeFrame = env.head
      if (frame.hasOwnProperty(vars)) {
        return frame[vars]
      }
      env = env.tail
    }
    throw Error(`Unbound variable ${vars}`)
}

export const isInTypeEnv = (vars: string) : boolean => {
    let env: TypeEnv | null = typeEnv
    while (env) {
      const frame : TypeFrame = env.head
      if (frame.hasOwnProperty(vars)) {
        return true 
      }
      env = env.tail
    }
    return false 
}