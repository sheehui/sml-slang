import { SmlType, TypedValue } from '../types'
import { FunctionType } from '../utils/cttc'

function templateToString(content: TemplateStringsArray | string, variables: any[]): string {
  if (typeof content === 'string') {
    return content
  }
  return variables.reduce(
    (built: string, fragment: string, index: number) => built + fragment + content[index + 1],
    content[0]
  )
}

export function oneLine(content: TemplateStringsArray | string, ...variables: any[]): string {
  return templateToString(content, variables)
    .replace(/(?:\n(?:\s*))+/g, ' ')
    .trim()
}

// Strips the "minimum indent" from every line in content,
// then trims whitespace at the beginning and end of the string.
//
// two spaces of "indent" removed from both lines:
//   stripIndent('  a\n  b') == 'a\nb'
// only one space of "indent" removed from both lines,
// because the first line only contains a single space of indent:
//   stripIndent(' a\n  b') == 'a\n b'
// first trims one space of indent from both lines,
// but later trims another space from the first line
// as it's at the beginning of the string:
//   stripIndent('  a\n b') == 'a\nb'
export function stripIndent(content: TemplateStringsArray | string, ...variables: any[]): string {
  const result = templateToString(content, variables)
  const match = result.match(/^[^\S\n]*(?=\S)/gm)
  const indent = match && Math.min(...match.map(el => el.length))
  if (indent) {
    return result.replace(new RegExp(`^.{${indent}}`, 'gm'), '').trim()
  }
  return result.trim()
}

export function simplify(content: string, maxLength = 15, separator = '...') {
  if (content.length < maxLength) {
    return content
  }
  const charsToTake = Math.ceil(maxLength - separator.length / 2)
  return content.slice(0, charsToTake) + ' ... ' + content.slice(charsToTake)
}

export const functionTypeToString = (type: FunctionType): string => {
  let result = ''

  for (let i = 0; i < type.args.length; i++) {
    const element = type.args[i]
    if (i !== 0) {
      result += ' * '
    }

    result += smlTypeToString(element)
  }

  result += ' -> '

  result += smlTypeToString(type.return) // abit sus

  return result
}

export const argToString = (type: FunctionType): string => {
  let result = ''

  for (let i = 0; i < type.args.length; i++) {
    const element = type.args[i]
    if (i !== 0) {
      result += ' * '
    }

    result += smlTypeToString(element)
  }

  return result
}
const clone = (items: any[]) : any => items.map((item: any) => Array.isArray(item) ? clone(item) : item)

export const smlTypedValToString = (sml: TypedValue) : string => {
  if (typeof sml.type === 'string') {
    return sml.value.toString()
  }
  const isTypeArr = Array.isArray(sml.type)
  if (isTypeArr && sml.type[sml.type.length - 1] == 'list') {
    let str = '['

    if (!Array.isArray(sml.value)) {
      throw Error("bad value")
    }

    for (let i = 0; i < sml.value.length; i++) {
      const element = sml.value[i]
      const copy = clone(sml.type)
      copy.pop()
      str += smlTypedValToString({
        type: copy,
        value: element
      })
      if (i !== sml.value.length - 1) {
        str += ", "
      }
    }

    return str + ']'
  } else if (isTypeArr && sml.type[sml.type.length - 1] == 'tuple') {
    let str = '('

    if (!Array.isArray(sml.value)) {
      throw Error("bad value")
    }

    for (let i = 0; i < sml.type.length - 1; i++) {
      const type = sml.type[i]
      str += smlTypedValToString({
        type,
        value: sml.value[i]
      })
      if (i !== sml.value.length - 1) {
        str += ", "
      }
    }

    str += ')'

    return str
  } else if (isTypeArr && sml.type[sml.type.length - 1] == 'fun') {
    return "fn"
  } else {
    return sml.value.toString()
  }
}


export const smlTypeToString = (type: SmlType): string => {
  const isTypeArr = Array.isArray(type)
  if (isTypeArr && type[type.length - 1] == 'list') {
    let str = ''

    type.forEach((element: SmlType | Array<SmlType>) => {
      if (Array.isArray(element)) {
        str += ' ' + smlTypeToString(element)
      } else {
        str += ' ' + element
      }
    })

    return str.trim()
  } else if (isTypeArr && type[type.length - 1] == 'tuple') {
    let str = '('

    for (let i = 0; i < type.length - 1; i++) {
      const element = type[i]
      if (i !== 0) {
        str += ' * '
      }
      if (Array.isArray(element)) {
        str += smlTypeToString(element)
      } else {
        str += element
      }
    }
    str += ')'

    return str
  } else if (isTypeArr && type[type.length - 1] == 'fun') {
    const paramsType = Array.isArray(type[0]) ? smlTypeToString(type[0]) : type[0]
    const retType = Array.isArray(type[1]) ? smlTypeToString(type[1]) : type[1]

    return `${paramsType} -> ${retType}`
  } else {
    return type.toString()
  }
}
