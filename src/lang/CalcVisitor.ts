// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { NumberContext } from "./CalcParser";
import { BooleanContext } from "./CalcParser";
import { IdentifierContext } from "./CalcParser";
import { ListContext } from "./CalcParser";
import { NegationContext } from "./CalcParser";
import { NotContext } from "./CalcParser";
import { ParenthesesContext } from "./CalcParser";
import { TupleContext } from "./CalcParser";
import { PowerContext } from "./CalcParser";
import { MultiplicationContext } from "./CalcParser";
import { DivisionContext } from "./CalcParser";
import { AdditionContext } from "./CalcParser";
import { SubtractionContext } from "./CalcParser";
import { ModuloContext } from "./CalcParser";
import { GreaterThanContext } from "./CalcParser";
import { GreaterThanOrEqualContext } from "./CalcParser";
import { LessThanContext } from "./CalcParser";
import { LessThanOrEqualContext } from "./CalcParser";
import { EqualContext } from "./CalcParser";
import { NequalContext } from "./CalcParser";
import { ConditionalContext } from "./CalcParser";
import { LocalDecContext } from "./CalcParser";
import { VarDecContext } from "./CalcParser";
import { FunDecContext } from "./CalcParser";
import { StartContext } from "./CalcParser";
import { StmtContext } from "./CalcParser";
import { ExpressionContext } from "./CalcParser";
import { SeqExprContext } from "./CalcParser";
import { SeqDeclContext } from "./CalcParser";
import { DeclarationContext } from "./CalcParser";
import { PatternContext } from "./CalcParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CalcParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CalcVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `Number`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumber?: (ctx: NumberContext) => Result;

	/**
	 * Visit a parse tree produced by the `Boolean`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolean?: (ctx: BooleanContext) => Result;

	/**
	 * Visit a parse tree produced by the `Identifier`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;

	/**
	 * Visit a parse tree produced by the `List`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitList?: (ctx: ListContext) => Result;

	/**
	 * Visit a parse tree produced by the `Negation`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegation?: (ctx: NegationContext) => Result;

	/**
	 * Visit a parse tree produced by the `Not`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNot?: (ctx: NotContext) => Result;

	/**
	 * Visit a parse tree produced by the `Parentheses`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParentheses?: (ctx: ParenthesesContext) => Result;

	/**
	 * Visit a parse tree produced by the `Tuple`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple?: (ctx: TupleContext) => Result;

	/**
	 * Visit a parse tree produced by the `Power`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPower?: (ctx: PowerContext) => Result;

	/**
	 * Visit a parse tree produced by the `Multiplication`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplication?: (ctx: MultiplicationContext) => Result;

	/**
	 * Visit a parse tree produced by the `Division`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDivision?: (ctx: DivisionContext) => Result;

	/**
	 * Visit a parse tree produced by the `Addition`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAddition?: (ctx: AdditionContext) => Result;

	/**
	 * Visit a parse tree produced by the `Subtraction`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubtraction?: (ctx: SubtractionContext) => Result;

	/**
	 * Visit a parse tree produced by the `Modulo`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModulo?: (ctx: ModuloContext) => Result;

	/**
	 * Visit a parse tree produced by the `GreaterThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGreaterThan?: (ctx: GreaterThanContext) => Result;

	/**
	 * Visit a parse tree produced by the `GreaterThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGreaterThanOrEqual?: (ctx: GreaterThanOrEqualContext) => Result;

	/**
	 * Visit a parse tree produced by the `LessThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLessThan?: (ctx: LessThanContext) => Result;

	/**
	 * Visit a parse tree produced by the `LessThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLessThanOrEqual?: (ctx: LessThanOrEqualContext) => Result;

	/**
	 * Visit a parse tree produced by the `Equal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEqual?: (ctx: EqualContext) => Result;

	/**
	 * Visit a parse tree produced by the `Nequal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNequal?: (ctx: NequalContext) => Result;

	/**
	 * Visit a parse tree produced by the `Conditional`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditional?: (ctx: ConditionalContext) => Result;

	/**
	 * Visit a parse tree produced by the `LocalDec`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLocalDec?: (ctx: LocalDecContext) => Result;

	/**
	 * Visit a parse tree produced by the `VarDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVarDec?: (ctx: VarDecContext) => Result;

	/**
	 * Visit a parse tree produced by the `FunDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunDec?: (ctx: FunDecContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.start`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart?: (ctx: StartContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.stmt`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStmt?: (ctx: StmtContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.seqExpr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSeqExpr?: (ctx: SeqExprContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.seqDecl`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSeqDecl?: (ctx: SeqDeclContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration?: (ctx: DeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `CalcParser.pattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPattern?: (ctx: PatternContext) => Result;
}

