#!/usr/bin/env node
import { start } from 'repl' // 'repl' here refers to the module named 'repl' in index.d.ts

import { sourceLanguages } from '../constants'
import { CompileTimeSourceError } from '../errors/compileTimeSourceError'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { createContext, IOptions, parseError, runInContext } from '../index'
import { ExecutionMethod,Variant } from '../types'
import { smlTypedValToString, smlTypeToString } from '../utils/formatters'

function startRepl(
  executionMethod: ExecutionMethod = 'interpreter',
  variant: Variant = Variant.DEFAULT,
  useSubst: boolean = false,
  useRepl: boolean,
  prelude = ''
) {
  // use defaults for everything
  const context = createContext(variant, undefined, undefined)
  const options: Partial<IOptions> = {
    scheduler: 'preemptive',
    executionMethod,
    variant,
    useSubst,
  }
  runInContext(prelude, context, options).then(preludeResult => {
    if (preludeResult.status === 'finished' || preludeResult.status === 'suspended-non-det') {
      console.dir(preludeResult.value, { depth: null })
      if (!useRepl) {
        return
      }
      start(
        // the object being passed as argument fits the interface ReplOptions in the repl module.
        { eval: (cmd, unusedContext, unusedFilename, callback) => {
            runInContext(cmd, context, options).then(obj => {
              if (obj.status === 'finished' || obj.status === 'suspended-non-det') {
                callback(null, obj.value)
              } else {
                callback(new Error(parseError(context.errors)), undefined)
              }
            }, error => {
              if (error instanceof RuntimeSourceError || error instanceof CompileTimeSourceError) {
                callback(null, new Error(error.explain()))
              } else {
                callback(null, new Error(error.message))
              }
            })
          },
          writer: output => {
            try {
              if (output.hasOwnProperty('type') && output.hasOwnProperty('value')) {
                return `\x1b[32m${smlTypedValToString(output)} : ${smlTypeToString(output.type)}\x1b[0m`
              } else {
                throw output
              }
            } catch (error) {
              return `\x1b[31m${error.message}\x1b[0m`
            }
          }
        }
      )
    } else {
      console.error(parseError(context.errors))
    }
  })
}

/**
 * Returns true iff the given chapter and variant combination is supported.
 */
function validChapterVariant(variant: any) {
  for (const lang of sourceLanguages) {
    if (lang.variant === variant) return true
  }

  return false
}

function main() {
  const opt = require('node-getopt')
    .create([
      ['v', 'variant=VARIANT', 'set the Source variant (i.e., calc)', 'calc'],
      ['h', 'help', 'display this help'],
      ['e', 'eval', "don't show REPL, only display output of evaluation"]
    ])
    .bindHelp()
    .setHelp('Usage: js-slang [PROGRAM_STRING] [OPTION]\n\n[[OPTIONS]]')
    .parseSystem()

  const variant = opt.options.variant
  const areValidChapterVariant: boolean = validChapterVariant(variant)
  if (!areValidChapterVariant) {
    throw new Error(
      'The chapter and variant combination provided is unsupported. Use the -h option to view valid chapters and variants.'
    )
  }

  const executionMethod =
    opt.options.variant === 'interpreter' || opt.options.variant === 'non-det'
      ? 'interpreter'
      : 'native'
  const useSubst = opt.options.variant === 'substituter'
  const useRepl = !opt.options.e
  const prelude = opt.argv[0] ?? ''
  startRepl(executionMethod, variant, useSubst, useRepl, prelude)
}

main()
