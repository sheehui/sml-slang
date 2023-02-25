// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `CalcParser`.
 */
export interface CalcListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `Number`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by the `Number`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;

	/**
	 * Enter a parse tree produced by the `Boolean`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterBoolean?: (ctx: BooleanContext) => void;
	/**
	 * Exit a parse tree produced by the `Boolean`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitBoolean?: (ctx: BooleanContext) => void;

	/**
	 * Enter a parse tree produced by the `Identifier`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Exit a parse tree produced by the `Identifier`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitIdentifier?: (ctx: IdentifierContext) => void;

	/**
	 * Enter a parse tree produced by the `List`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterList?: (ctx: ListContext) => void;
	/**
	 * Exit a parse tree produced by the `List`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitList?: (ctx: ListContext) => void;

	/**
	 * Enter a parse tree produced by the `Negation`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNegation?: (ctx: NegationContext) => void;
	/**
	 * Exit a parse tree produced by the `Negation`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNegation?: (ctx: NegationContext) => void;

	/**
	 * Enter a parse tree produced by the `Not`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNot?: (ctx: NotContext) => void;
	/**
	 * Exit a parse tree produced by the `Not`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNot?: (ctx: NotContext) => void;

	/**
	 * Enter a parse tree produced by the `Parentheses`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterParentheses?: (ctx: ParenthesesContext) => void;
	/**
	 * Exit a parse tree produced by the `Parentheses`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitParentheses?: (ctx: ParenthesesContext) => void;

	/**
	 * Enter a parse tree produced by the `Tuple`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterTuple?: (ctx: TupleContext) => void;
	/**
	 * Exit a parse tree produced by the `Tuple`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitTuple?: (ctx: TupleContext) => void;

	/**
	 * Enter a parse tree produced by the `Power`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterPower?: (ctx: PowerContext) => void;
	/**
	 * Exit a parse tree produced by the `Power`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitPower?: (ctx: PowerContext) => void;

	/**
	 * Enter a parse tree produced by the `Multiplication`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterMultiplication?: (ctx: MultiplicationContext) => void;
	/**
	 * Exit a parse tree produced by the `Multiplication`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitMultiplication?: (ctx: MultiplicationContext) => void;

	/**
	 * Enter a parse tree produced by the `Division`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterDivision?: (ctx: DivisionContext) => void;
	/**
	 * Exit a parse tree produced by the `Division`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitDivision?: (ctx: DivisionContext) => void;

	/**
	 * Enter a parse tree produced by the `Addition`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterAddition?: (ctx: AdditionContext) => void;
	/**
	 * Exit a parse tree produced by the `Addition`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitAddition?: (ctx: AdditionContext) => void;

	/**
	 * Enter a parse tree produced by the `Subtraction`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterSubtraction?: (ctx: SubtractionContext) => void;
	/**
	 * Exit a parse tree produced by the `Subtraction`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitSubtraction?: (ctx: SubtractionContext) => void;

	/**
	 * Enter a parse tree produced by the `Modulo`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterModulo?: (ctx: ModuloContext) => void;
	/**
	 * Exit a parse tree produced by the `Modulo`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitModulo?: (ctx: ModuloContext) => void;

	/**
	 * Enter a parse tree produced by the `GreaterThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterGreaterThan?: (ctx: GreaterThanContext) => void;
	/**
	 * Exit a parse tree produced by the `GreaterThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitGreaterThan?: (ctx: GreaterThanContext) => void;

	/**
	 * Enter a parse tree produced by the `GreaterThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterGreaterThanOrEqual?: (ctx: GreaterThanOrEqualContext) => void;
	/**
	 * Exit a parse tree produced by the `GreaterThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitGreaterThanOrEqual?: (ctx: GreaterThanOrEqualContext) => void;

	/**
	 * Enter a parse tree produced by the `LessThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterLessThan?: (ctx: LessThanContext) => void;
	/**
	 * Exit a parse tree produced by the `LessThan`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitLessThan?: (ctx: LessThanContext) => void;

	/**
	 * Enter a parse tree produced by the `LessThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterLessThanOrEqual?: (ctx: LessThanOrEqualContext) => void;
	/**
	 * Exit a parse tree produced by the `LessThanOrEqual`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitLessThanOrEqual?: (ctx: LessThanOrEqualContext) => void;

	/**
	 * Enter a parse tree produced by the `Equal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterEqual?: (ctx: EqualContext) => void;
	/**
	 * Exit a parse tree produced by the `Equal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitEqual?: (ctx: EqualContext) => void;

	/**
	 * Enter a parse tree produced by the `Nequal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNequal?: (ctx: NequalContext) => void;
	/**
	 * Exit a parse tree produced by the `Nequal`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNequal?: (ctx: NequalContext) => void;

	/**
	 * Enter a parse tree produced by the `Conditional`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterConditional?: (ctx: ConditionalContext) => void;
	/**
	 * Exit a parse tree produced by the `Conditional`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitConditional?: (ctx: ConditionalContext) => void;

	/**
	 * Enter a parse tree produced by the `LocalDec`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterLocalDec?: (ctx: LocalDecContext) => void;
	/**
	 * Exit a parse tree produced by the `LocalDec`
	 * labeled alternative in `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitLocalDec?: (ctx: LocalDecContext) => void;

	/**
	 * Enter a parse tree produced by the `VarDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterVarDec?: (ctx: VarDecContext) => void;
	/**
	 * Exit a parse tree produced by the `VarDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitVarDec?: (ctx: VarDecContext) => void;

	/**
	 * Enter a parse tree produced by the `FunDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterFunDec?: (ctx: FunDecContext) => void;
	/**
	 * Exit a parse tree produced by the `FunDec`
	 * labeled alternative in `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitFunDec?: (ctx: FunDecContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.start`.
	 * @param ctx the parse tree
	 */
	enterStart?: (ctx: StartContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.start`.
	 * @param ctx the parse tree
	 */
	exitStart?: (ctx: StartContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.stmt`.
	 * @param ctx the parse tree
	 */
	enterStmt?: (ctx: StmtContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.stmt`.
	 * @param ctx the parse tree
	 */
	exitStmt?: (ctx: StmtContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.seqExpr`.
	 * @param ctx the parse tree
	 */
	enterSeqExpr?: (ctx: SeqExprContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.seqExpr`.
	 * @param ctx the parse tree
	 */
	exitSeqExpr?: (ctx: SeqExprContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.seqDecl`.
	 * @param ctx the parse tree
	 */
	enterSeqDecl?: (ctx: SeqDeclContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.seqDecl`.
	 * @param ctx the parse tree
	 */
	exitSeqDecl?: (ctx: SeqDeclContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterDeclaration?: (ctx: DeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitDeclaration?: (ctx: DeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `CalcParser.pattern`.
	 * @param ctx the parse tree
	 */
	enterPattern?: (ctx: PatternContext) => void;
	/**
	 * Exit a parse tree produced by `CalcParser.pattern`.
	 * @param ctx the parse tree
	 */
	exitPattern?: (ctx: PatternContext) => void;
}

