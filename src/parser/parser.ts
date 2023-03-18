/* tslint:disable:max-classes-per-file */
import { CharStreams, CommonTokenStream } from 'antlr4ts'
import { Token } from 'antlr4ts/Token'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { RuleNode } from 'antlr4ts/tree/RuleNode'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import * as es from 'estree'

import { SmlSlangLexer } from '../lang/SmlSlangLexer'
import {
  AdditionContext,
  AppendContext,
  BooleanContext,
  ConditionalContext,
  ConstructContext,
  DeclarationContext,
  EqualContext,
  ExpressionContext,
  FactorContext,
  FuncAppContext,
  FuncExprContext,
  FunDecContext,
  GreaterThanContext,
  GreaterThanOrEqualContext,
  IdentifierContext,
  LessThanContext,
  LessThanOrEqualContext,
  ListContext,
  LocalDecContext,
  LocalDecsContext,
  NegationContext,
  NequalContext,
  NilContext,
  NotContext,
  NumberContext,
  ParenthesesContext,
  PattBoolContext,
  PattIdContext,
  PattNumContext,
  PattTupleContext,
  PattWildcContext,
  PowerContext,
  SeqDeclContext,
  SeqExprContext,
  SmlSlangParser,
  StartContext,
  StmtContext,
  StringContext,
  SubtractionContext,
  TupleAccessContext,
  TupleContext,
  VarDecContext
} from '../lang/SmlSlangParser'
import { SmlSlangVisitor } from '../lang/SmlSlangVisitor'
import { Context, ErrorSeverity, ErrorType, SourceError } from '../types'
import { stripIndent } from '../utils/formatters'

export class DisallowedConstructError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public nodeType: string

  constructor(public node: es.Node) {
    this.nodeType = this.formatNodeType(this.node.type)
  }

  get location() {
    return this.node.loc!
  }

  public explain() {
    return `${this.nodeType} are not allowed`
  }

  public elaborate() {
    return stripIndent`
      You are trying to use ${this.nodeType}, which is not allowed (yet).
    `
  }

  /**
   * Converts estree node.type into english
   * e.g. ThisExpression -> 'this' expressions
   *      Property -> Properties
   *      EmptyStatement -> Empty Statements
   */
  private formatNodeType(nodeType: string) {
    switch (nodeType) {
      case 'ThisExpression':
        return "'this' expressions"
      case 'Property':
        return 'Properties'
      default: {
        const words = nodeType.split(/(?=[A-Z])/)
        return words.map((word, i) => (i === 0 ? word : word.toLowerCase())).join(' ') + 's'
      }
    }
  }
}

export class FatalSyntaxError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a syntax error in your program'
  }
}

export class MissingSemicolonError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation) {}

  public explain() {
    return 'Missing semicolon at the end of statement'
  }

  public elaborate() {
    return 'Every statement must be terminated by a semicolon.'
  }
}

export class TrailingCommaError implements SourceError {
  public type: ErrorType.SYNTAX
  public severity: ErrorSeverity.WARNING
  public constructor(public location: es.SourceLocation) {}

  public explain() {
    return 'Trailing comma'
  }

  public elaborate() {
    return 'Please remove the trailing comma'
  }
}

function contextToLocation(ctx: ExpressionContext): es.SourceLocation {
  return {
    start: {
      line: ctx.start.line,
      column: ctx.start.charPositionInLine
    },
    end: {
      line: ctx.stop ? ctx.stop.line : ctx.start.line,
      column: ctx.stop ? ctx.stop.charPositionInLine : ctx.start.charPositionInLine
    }
  }
}

function smlToJsBinop(token: Token): es.BinaryOperator {
  switch (token.text) {
    case '*':
      return '*'
    case 'div':
      return '/'
    case '%':
      return '%'
    default:
      throw Error('undefined sml binop token ' + token.text)
  }
}

class ExpressionGenerator implements SmlSlangVisitor<es.Expression> {
  visitNumber(ctx: NumberContext): es.Expression {
    return {
      type: 'Literal',
      value: parseInt(ctx.text),
      raw: ctx.text,
      loc: contextToLocation(ctx)
    }
  }
  visitBoolean(ctx: BooleanContext): es.Expression {
    return {
      type: 'Literal',
      value: ctx.text === 'true',
      raw: ctx.text,
      loc: contextToLocation(ctx)
    }
  }
  visitNil(ctx: NilContext): es.Expression {
    return {
      type: 'Literal',
      value: null,
      raw: ctx.text,
      loc: contextToLocation(ctx)
    }
  }
  visitIdentifier(ctx: IdentifierContext): es.Expression {
    return {
      type: 'Identifier',
      name: ctx.text
    }
  }
  visitString(ctx: StringContext): es.Expression {
    return {
      type: 'Literal',
      value: ctx.text.substring(1, ctx.text.length - 1),
      raw: ctx.text,
      loc: contextToLocation(ctx)
    }
  }
  visitNot(ctx: NotContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '~',
      prefix: true,
      argument: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }
  visitNegation(ctx: NegationContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '-',
      prefix: true,
      argument: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }
  visitParentheses(ctx: ParenthesesContext): es.Expression {
    return this.visit(ctx.expression())
  }
  visitPower(ctx: PowerContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '^',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitFactor(ctx: FactorContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: smlToJsBinop(ctx._operator),
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitAddition(ctx: AdditionContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '+',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtraction(ctx: SubtractionContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '-',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitConstruct(ctx: ConstructContext): es.Expression {
    const expressions: es.Expression[] = ctx.expression().map(exp => exp.accept(this))
    return {
      type: 'ArrayExpression',
      elements: expressions,
      leadingComments: [{ type: 'Line', value: 'list_construct' }],
      loc: contextToLocation(ctx)
    }
  }

  visitAppend(ctx: AppendContext): es.Expression {
    const expressions: es.Expression[] = [this.visit(ctx._left), this.visit(ctx._right)]
    return {
      type: 'ArrayExpression',
      elements: expressions,
      leadingComments: [{ type: 'Line', value: 'list_append' }],
      loc: contextToLocation(ctx)
    }
  }

  visitGreaterThan(ctx: GreaterThanContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitGreaterThanOrEqual(ctx: GreaterThanOrEqualContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLessThan(ctx: LessThanContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLessThanOrEqual(ctx: LessThanOrEqualContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitEqual(ctx: EqualContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '===',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitNequal(ctx: NequalContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '!==',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitConditional(ctx: ConditionalContext): es.Expression {
    return {
      type: 'ConditionalExpression',
      test: this.visit(ctx._pred),
      alternate: this.visit(ctx._alt),
      consequent: this.visit(ctx._cons),
      loc: contextToLocation(ctx)
    }
  }

  visitList(ctx: ListContext): es.Expression {
    const expressions: es.Expression[] = ctx.expression().map(exp => exp.accept(this))
    return {
      type: 'ArrayExpression',
      elements: expressions,
      leadingComments: [{ type: 'Line', value: 'list_lit' }],
      loc: contextToLocation(ctx)
    }
  }

  visitTuple(ctx: TupleContext): es.Expression {
    const expressions: es.Expression[] = ctx.expression().map(exp => exp.accept(this))
    return {
      type: 'ArrayExpression',
      elements: expressions,
      leadingComments: [{ type: 'Line', value: 'tuple_lit' }],
      loc: contextToLocation(ctx)
    }
  }

  visitTupleAccess(ctx: TupleAccessContext): es.Expression {
    const literal: es.Expression = {
      type: 'Literal',
      value: parseInt(ctx._record.text!.substring(1)),
      raw: ctx._record.text,
      loc: contextToLocation(ctx)
    }
    return {
      type: 'MemberExpression',
      object: this.visit(ctx._expr),
      property: literal,
      computed: false,
      optional: false
    }
  }

  visitLocalDec(ctx: LocalDecContext): es.Expression {
    const expressions = this.visitSeqExpr(ctx._expr)
    expressions['locals'] = {
      type: 'VariableDeclaration',
      declarations: new DeclarationGenerator().visitSeqDec(ctx._decl),
      kind: 'const'
    }
    return expressions
  }

  visitFuncApp(ctx: FuncAppContext): es.Expression {
    const callee: es.Expression = this.visit(ctx._callee)
    if (!['Identifier', 'FunctionExpression'].includes(callee.type)) {
      throw Error(`Cannot apply to a ${callee.type}`)
    }
    const exprs = ctx.expression()
    const args = []
    for (let i = 1; i < exprs.length; i++) {
      // skip the first expr as its the callee
      args.push(exprs[i].accept(this))
    }
    return {
      type: 'CallExpression',
      callee,
      arguments: args,
      optional: false // not sure what this does yet
    }
  }

  visitFuncExpr(ctx: FuncExprContext): es.Expression {
    return {
      type: 'FunctionExpression',
      id: null,
      params: new PatternGenerator().visit(ctx._params),
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: new ExpressionGenerator().visit(ctx.expression()!)
          }
        ]
      }
    }
  }

  visitSeqExpr(ctx: SeqExprContext): es.Expression {
    const expressions: es.Expression[] = ctx.expression().map(exp => exp.accept(this))
    return {
      type: 'SequenceExpression',
      expressions
    }
  }

  visitExpression?: ((ctx: ExpressionContext) => es.Expression) | undefined
  visitStart?: ((ctx: StartContext) => es.Expression) | undefined

  visit(tree: ParseTree): es.Expression {
    return tree.accept(this)
  }
  visitChildren(node: RuleNode): es.Expression {
    const expressions: es.Expression[] = []
    for (let i = 0; i < node.childCount; i++) {
      expressions.push(node.getChild(i).accept(this))
    }
    return {
      type: 'SequenceExpression',
      expressions
    }
  }
  visitTerminal(node: TerminalNode): es.Expression {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.Expression {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class DeclarationGenerator implements SmlSlangVisitor<es.VariableDeclarator[]> {
  visitVarDec(ctx: VarDecContext): es.VariableDeclarator[] {
    const init = new ExpressionGenerator().visit(ctx._value) // variable value
    const id: es.Identifier = {
      type: 'Identifier',
      name: ctx._identifier.text! // '!' is a non-null assertion operator
    }

    if (ctx.REC() && init.type === 'FunctionExpression') {
      // 'rec' can only be specified for lambdas
      // set id on lambda so that var name can be bound within the func block
      // var dec will basically behave like a 'fun' dec
      init.id = id
    }
    return [
      {
        type: 'VariableDeclarator',
        id,
        init
      }
    ]
  }
  visitFunDec(ctx: FunDecContext): es.VariableDeclarator[] {
    const identifier = {
      type: 'Identifier',
      name: ctx._identifier.text!
    } as es.Identifier

    return [
      {
        type: 'VariableDeclarator',
        id: identifier,
        init: {
          type: 'FunctionExpression',
          id: identifier,
          params: new PatternGenerator().visit(ctx.pattern()),
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: new ExpressionGenerator().visit(ctx.expression())
              }
            ]
          }
        }
      }
    ]
  }
  visitLocalDecs(ctx: LocalDecsContext): es.VariableDeclarator[] {
    const localDecs: es.VariableDeclarator[] = this.visitSeqDec(ctx._localDecs)
    const decs: es.VariableDeclarator[] = this.visitSeqDec(ctx._decs)
    if (decs.length > 0) {
      // to handle nested local (i.e. if decs has its own 'locals' field)
      const prevDecs: es.VariableDeclarator[] = decs[0]['locals']
        ? decs[0]['locals'].decs.declarations
        : []

      decs[0]['locals'] = {
        decs: {
          type: 'VariableDeclaration',
          declarations: localDecs.concat(prevDecs),
          kind: 'const'
        },
        arity: decs.length
      }
    }
    return decs
  }
  visitSeqDec(ctx: SeqDeclContext): es.VariableDeclarator[] {
    const ctxs = ctx.declaration()
    let declarations: es.VariableDeclarator[] = []
    for (let i = 0; i < ctxs.length; i++) {
      declarations = declarations.concat(ctxs[i].accept(this))
    }
    return declarations
  }

  visitDeclaration(ctx: DeclarationContext): es.VariableDeclarator[] {
    return this.visitVarDec(ctx as VarDecContext)
  }

  visit(tree: ParseTree): es.VariableDeclarator[] {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.VariableDeclarator[] {
    const decs: es.VariableDeclarator[] = []
    for (let i = 0; i < node.childCount; i++) {
      decs.concat(node.getChild(i).accept(this))
    }
    return decs
  }

  visitTerminal(node: TerminalNode): es.VariableDeclarator[] {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.VariableDeclarator[] {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class StmtGenerator implements SmlSlangVisitor<es.Statement> {
  visitStmt(ctx: StmtContext): es.Statement {
    if (ctx.seqExpr()) {
      const generator = new ExpressionGenerator()
      return {
        type: 'ExpressionStatement',
        expression: generator.visitSeqExpr(ctx.seqExpr()!)
      } as es.ExpressionStatement
    } else {
      const generator = new DeclarationGenerator()
      const declarations = generator.visitSeqDec(ctx.seqDecl()!)
      return {
        type: 'VariableDeclaration',
        declarations,
        kind: 'const'
      }
    }
  }

  visit(tree: ParseTree): es.Statement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Statement {
    return node.accept(this)
  }

  visitTerminal(node: TerminalNode): es.Statement {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.Statement {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class PatternGenerator implements SmlSlangVisitor<es.Pattern[]> {
  visitPattId(ctx: PattIdContext): es.Pattern[] {
    return [
      {
        type: 'Identifier',
        name: ctx.ID()?.text!
      }
    ]
  }

  visitPattWildc(ctx: PattWildcContext): es.Pattern[] {
    return [
      {
        type: 'Identifier',
        name: '_'
      }
    ]
  }

  visitPattTuple(ctx: PattTupleContext): es.Pattern[] {
    const patterns = ctx.pattern()
    const elements = patterns.reduce((x, y) => x.concat(y.accept(this)), [] as es.Pattern[])
    return elements
  }

  visitPattNum(ctx: PattNumContext): es.Pattern[] {
    return [
      {
        type: 'Identifier',
        name: '_'
      }
    ]
  }

  visitPattBool(ctx: PattBoolContext): es.Pattern[] {
    return [
      {
        type: 'Identifier',
        name: '_'
      }
    ]
  }

  visit(tree: ParseTree): es.Pattern[] {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Pattern[] {
    return node.accept(this)
  }

  visitTerminal(node: TerminalNode): es.Pattern[] {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.Pattern[] {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

function convertSource(start: StartContext): es.Program {
  const generator = new StmtGenerator()
  return {
    type: 'Program',
    sourceType: 'script',
    body: [
      {
        type: 'BlockStatement',
        body: start.stmt().map(ctx => {
          return ctx.accept(generator)
        })
      }
    ]
  }
}

export function parse(source: string, context: Context) {
  let program: es.Program | undefined

  if (context.variant === 'calc') {
    const inputStream = CharStreams.fromString(source)
    const lexer = new SmlSlangLexer(inputStream)
    const tokenStream = new CommonTokenStream(lexer)
    const parser = new SmlSlangParser(tokenStream)
    parser.buildParseTree = true
    try {
      const tree = parser.start()
      program = convertSource(tree)
    } catch (error) {
      if (error instanceof FatalSyntaxError) {
        context.errors.push(error)
      } else {
        throw error
      }
    }
    const hasErrors = context.errors.find(m => m.severity === ErrorSeverity.ERROR)
    if (program && !hasErrors) {
      return program
    } else {
      return undefined
    }
  } else {
    return undefined
  }
}
