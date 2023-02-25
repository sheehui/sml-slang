// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { CalcListener } from "./CalcListener";
import { CalcVisitor } from "./CalcVisitor";


export class CalcParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly POW = 6;
	public static readonly MUL = 7;
	public static readonly DIV = 8;
	public static readonly ADD = 9;
	public static readonly SUB = 10;
	public static readonly MOD = 11;
	public static readonly EQUAL = 12;
	public static readonly GT = 13;
	public static readonly GTE = 14;
	public static readonly LT = 15;
	public static readonly LTE = 16;
	public static readonly NEQUAL = 17;
	public static readonly NOT = 18;
	public static readonly NEG = 19;
	public static readonly BOOLEAN = 20;
	public static readonly IF = 21;
	public static readonly ELSE = 22;
	public static readonly THEN = 23;
	public static readonly VAL = 24;
	public static readonly LET = 25;
	public static readonly IN = 26;
	public static readonly END = 27;
	public static readonly FUN = 28;
	public static readonly SEMIC = 29;
	public static readonly WILDC = 30;
	public static readonly NUMBER = 31;
	public static readonly ID = 32;
	public static readonly WHITESPACE = 33;
	public static readonly RULE_start = 0;
	public static readonly RULE_stmt = 1;
	public static readonly RULE_expression = 2;
	public static readonly RULE_seqExpr = 3;
	public static readonly RULE_seqDecl = 4;
	public static readonly RULE_declaration = 5;
	public static readonly RULE_pattern = 6;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"start", "stmt", "expression", "seqExpr", "seqDecl", "declaration", "pattern",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'['", "','", "']'", "'('", "')'", "'^'", "'*'", "'div'", "'+'", 
		"'-'", "'mod'", "'='", "'>'", "'>='", "'<'", "'<='", "'<>'", "'not'", 
		"'~'", undefined, "'if'", "'else'", "'then'", "'val'", "'let'", "'in'", 
		"'end'", "'fun'", "';'", "'_'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, "POW", 
		"MUL", "DIV", "ADD", "SUB", "MOD", "EQUAL", "GT", "GTE", "LT", "LTE", 
		"NEQUAL", "NOT", "NEG", "BOOLEAN", "IF", "ELSE", "THEN", "VAL", "LET", 
		"IN", "END", "FUN", "SEMIC", "WILDC", "NUMBER", "ID", "WHITESPACE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CalcParser._LITERAL_NAMES, CalcParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CalcParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Calc.g4"; }

	// @Override
	public get ruleNames(): string[] { return CalcParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return CalcParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CalcParser._ATN, this);
	}
	// @RuleVersion(0)
	public start(): StartContext {
		let _localctx: StartContext = new StartContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CalcParser.RULE_start);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 15;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 14;
				this.stmt();
				}
				}
				this.state = 17;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 1)) & ~0x1F) === 0 && ((1 << (_la - 1)) & ((1 << (CalcParser.T__0 - 1)) | (1 << (CalcParser.T__3 - 1)) | (1 << (CalcParser.NOT - 1)) | (1 << (CalcParser.NEG - 1)) | (1 << (CalcParser.BOOLEAN - 1)) | (1 << (CalcParser.IF - 1)) | (1 << (CalcParser.VAL - 1)) | (1 << (CalcParser.LET - 1)) | (1 << (CalcParser.FUN - 1)) | (1 << (CalcParser.NUMBER - 1)) | (1 << (CalcParser.ID - 1)))) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public stmt(): StmtContext {
		let _localctx: StmtContext = new StmtContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CalcParser.RULE_stmt);
		try {
			this.state = 21;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CalcParser.T__0:
			case CalcParser.T__3:
			case CalcParser.NOT:
			case CalcParser.NEG:
			case CalcParser.BOOLEAN:
			case CalcParser.IF:
			case CalcParser.LET:
			case CalcParser.NUMBER:
			case CalcParser.ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 19;
				this.seqExpr();
				}
				break;
			case CalcParser.VAL:
			case CalcParser.FUN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 20;
				this.seqDecl();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 4;
		this.enterRecursionRule(_localctx, 4, CalcParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 60;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CalcParser.NUMBER:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 24;
				this.match(CalcParser.NUMBER);
				}
				break;
			case CalcParser.BOOLEAN:
				{
				_localctx = new BooleanContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 25;
				this.match(CalcParser.BOOLEAN);
				}
				break;
			case CalcParser.ID:
				{
				_localctx = new IdentifierContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 26;
				this.match(CalcParser.ID);
				}
				break;
			case CalcParser.T__0:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 27;
				this.match(CalcParser.T__0);
				this.state = 36;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 1)) & ~0x1F) === 0 && ((1 << (_la - 1)) & ((1 << (CalcParser.T__0 - 1)) | (1 << (CalcParser.T__3 - 1)) | (1 << (CalcParser.NOT - 1)) | (1 << (CalcParser.NEG - 1)) | (1 << (CalcParser.BOOLEAN - 1)) | (1 << (CalcParser.IF - 1)) | (1 << (CalcParser.LET - 1)) | (1 << (CalcParser.NUMBER - 1)) | (1 << (CalcParser.ID - 1)))) !== 0)) {
					{
					this.state = 28;
					this.expression(0);
					this.state = 33;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === CalcParser.T__1) {
						{
						{
						this.state = 29;
						this.match(CalcParser.T__1);
						this.state = 30;
						this.expression(0);
						}
						}
						this.state = 35;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 38;
				this.match(CalcParser.T__2);
				}
				break;
			case CalcParser.NEG:
				{
				_localctx = new NegationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 39;
				(_localctx as NegationContext)._operator = this.match(CalcParser.NEG);
				this.state = 40;
				(_localctx as NegationContext)._right = this.expression(17);
				}
				break;
			case CalcParser.NOT:
				{
				_localctx = new NotContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 41;
				(_localctx as NotContext)._operator = this.match(CalcParser.NOT);
				this.state = 42;
				(_localctx as NotContext)._right = this.expression(16);
				}
				break;
			case CalcParser.T__3:
				{
				_localctx = new ParenthesesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 43;
				this.match(CalcParser.T__3);
				this.state = 44;
				(_localctx as ParenthesesContext)._inner = this.expression(0);
				this.state = 45;
				this.match(CalcParser.T__4);
				}
				break;
			case CalcParser.IF:
				{
				_localctx = new ConditionalContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 47;
				this.match(CalcParser.IF);
				this.state = 48;
				(_localctx as ConditionalContext)._pred = this.expression(0);
				this.state = 49;
				this.match(CalcParser.THEN);
				this.state = 50;
				(_localctx as ConditionalContext)._cons = this.expression(0);
				this.state = 51;
				this.match(CalcParser.ELSE);
				this.state = 52;
				(_localctx as ConditionalContext)._alt = this.expression(2);
				}
				break;
			case CalcParser.LET:
				{
				_localctx = new LocalDecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 54;
				this.match(CalcParser.LET);
				this.state = 55;
				(_localctx as LocalDecContext)._decl = this.seqDecl();
				this.state = 56;
				this.match(CalcParser.IN);
				this.state = 57;
				(_localctx as LocalDecContext)._expr = this.seqExpr();
				this.state = 58;
				this.match(CalcParser.END);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 100;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 98;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as PowerContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 62;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 63;
						(_localctx as PowerContext)._operator = this.match(CalcParser.POW);
						this.state = 64;
						(_localctx as PowerContext)._right = this.expression(15);
						}
						break;

					case 2:
						{
						_localctx = new MultiplicationContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as MultiplicationContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 65;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 66;
						(_localctx as MultiplicationContext)._operator = this.match(CalcParser.MUL);
						this.state = 67;
						(_localctx as MultiplicationContext)._right = this.expression(14);
						}
						break;

					case 3:
						{
						_localctx = new DivisionContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as DivisionContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 68;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 69;
						(_localctx as DivisionContext)._operator = this.match(CalcParser.DIV);
						this.state = 70;
						(_localctx as DivisionContext)._right = this.expression(13);
						}
						break;

					case 4:
						{
						_localctx = new AdditionContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as AdditionContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 71;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 72;
						(_localctx as AdditionContext)._operator = this.match(CalcParser.ADD);
						this.state = 73;
						(_localctx as AdditionContext)._right = this.expression(12);
						}
						break;

					case 5:
						{
						_localctx = new SubtractionContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as SubtractionContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 74;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 75;
						(_localctx as SubtractionContext)._operator = this.match(CalcParser.SUB);
						this.state = 76;
						(_localctx as SubtractionContext)._right = this.expression(11);
						}
						break;

					case 6:
						{
						_localctx = new ModuloContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as ModuloContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 77;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 78;
						(_localctx as ModuloContext)._operator = this.match(CalcParser.MOD);
						this.state = 79;
						(_localctx as ModuloContext)._right = this.expression(10);
						}
						break;

					case 7:
						{
						_localctx = new GreaterThanContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as GreaterThanContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 80;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 81;
						(_localctx as GreaterThanContext)._operator = this.match(CalcParser.GT);
						this.state = 82;
						(_localctx as GreaterThanContext)._right = this.expression(9);
						}
						break;

					case 8:
						{
						_localctx = new GreaterThanOrEqualContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as GreaterThanOrEqualContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 83;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 84;
						(_localctx as GreaterThanOrEqualContext)._operator = this.match(CalcParser.GTE);
						this.state = 85;
						(_localctx as GreaterThanOrEqualContext)._right = this.expression(8);
						}
						break;

					case 9:
						{
						_localctx = new LessThanContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as LessThanContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 86;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 87;
						(_localctx as LessThanContext)._operator = this.match(CalcParser.LT);
						this.state = 88;
						(_localctx as LessThanContext)._right = this.expression(7);
						}
						break;

					case 10:
						{
						_localctx = new LessThanOrEqualContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as LessThanOrEqualContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 89;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 90;
						(_localctx as LessThanOrEqualContext)._operator = this.match(CalcParser.LTE);
						this.state = 91;
						(_localctx as LessThanOrEqualContext)._right = this.expression(6);
						}
						break;

					case 11:
						{
						_localctx = new EqualContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as EqualContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 92;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 93;
						(_localctx as EqualContext)._operator = this.match(CalcParser.EQUAL);
						this.state = 94;
						(_localctx as EqualContext)._right = this.expression(5);
						}
						break;

					case 12:
						{
						_localctx = new NequalContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as NequalContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression);
						this.state = 95;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 96;
						(_localctx as NequalContext)._operator = this.match(CalcParser.NEQUAL);
						this.state = 97;
						(_localctx as NequalContext)._right = this.expression(4);
						}
						break;
					}
					}
				}
				this.state = 102;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public seqExpr(): SeqExprContext {
		let _localctx: SeqExprContext = new SeqExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CalcParser.RULE_seqExpr);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 106;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 103;
					this.expression(0);
					this.state = 104;
					this.match(CalcParser.SEMIC);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 108;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public seqDecl(): SeqDeclContext {
		let _localctx: SeqDeclContext = new SeqDeclContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, CalcParser.RULE_seqDecl);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 113;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 110;
					this.declaration();
					this.state = 111;
					this.match(CalcParser.SEMIC);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 115;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 8, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaration(): DeclarationContext {
		let _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CalcParser.RULE_declaration);
		try {
			this.state = 127;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CalcParser.VAL:
				_localctx = new VarDecContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 117;
				this.match(CalcParser.VAL);
				this.state = 118;
				(_localctx as VarDecContext)._identifier = this.match(CalcParser.ID);
				this.state = 119;
				this.match(CalcParser.EQUAL);
				this.state = 120;
				(_localctx as VarDecContext)._value = this.expression(0);
				}
				break;
			case CalcParser.FUN:
				_localctx = new FunDecContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 121;
				this.match(CalcParser.FUN);
				this.state = 122;
				(_localctx as FunDecContext)._identifier = this.match(CalcParser.ID);
				this.state = 123;
				(_localctx as FunDecContext)._params = this.pattern();
				this.state = 124;
				this.match(CalcParser.EQUAL);
				this.state = 125;
				(_localctx as FunDecContext)._value = this.expression(0);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pattern(): PatternContext {
		let _localctx: PatternContext = new PatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CalcParser.RULE_pattern);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 129;
			_la = this._input.LA(1);
			if (!(((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & ((1 << (CalcParser.BOOLEAN - 20)) | (1 << (CalcParser.WILDC - 20)) | (1 << (CalcParser.NUMBER - 20)) | (1 << (CalcParser.ID - 20)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 2:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 14);

		case 1:
			return this.precpred(this._ctx, 13);

		case 2:
			return this.precpred(this._ctx, 12);

		case 3:
			return this.precpred(this._ctx, 11);

		case 4:
			return this.precpred(this._ctx, 10);

		case 5:
			return this.precpred(this._ctx, 9);

		case 6:
			return this.precpred(this._ctx, 8);

		case 7:
			return this.precpred(this._ctx, 7);

		case 8:
			return this.precpred(this._ctx, 6);

		case 9:
			return this.precpred(this._ctx, 5);

		case 10:
			return this.precpred(this._ctx, 4);

		case 11:
			return this.precpred(this._ctx, 3);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03#\x86\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x03\x02\x06\x02\x12\n\x02\r\x02\x0E\x02\x13\x03\x03\x03" +
		"\x03\x05\x03\x18\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x07\x04\"\n\x04\f\x04\x0E\x04%\v\x04\x05\x04\'\n\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04?\n\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04e\n\x04\f\x04" +
		"\x0E\x04h\v\x04\x03\x05\x03\x05\x03\x05\x06\x05m\n\x05\r\x05\x0E\x05n" +
		"\x03\x06\x03\x06\x03\x06\x06\x06t\n\x06\r\x06\x0E\x06u\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07" +
		"\x82\n\x07\x03\b\x03\b\x03\b\x02\x02\x03\x06\t\x02\x02\x04\x02\x06\x02" +
		"\b\x02\n\x02\f\x02\x0E\x02\x02\x03\x04\x02\x16\x16 \"\x02\x99\x02\x11" +
		"\x03\x02\x02\x02\x04\x17\x03\x02\x02\x02\x06>\x03\x02\x02\x02\bl\x03\x02" +
		"\x02\x02\ns\x03\x02\x02\x02\f\x81\x03\x02\x02\x02\x0E\x83\x03\x02\x02" +
		"\x02\x10\x12\x05\x04\x03\x02\x11\x10\x03\x02\x02\x02\x12\x13\x03\x02\x02" +
		"\x02\x13\x11\x03\x02\x02\x02\x13\x14\x03\x02\x02\x02\x14\x03\x03\x02\x02" +
		"\x02\x15\x18\x05\b\x05\x02\x16\x18\x05\n\x06\x02\x17\x15\x03\x02\x02\x02" +
		"\x17\x16\x03\x02\x02\x02\x18\x05\x03\x02\x02\x02\x19\x1A\b\x04\x01\x02" +
		"\x1A?\x07!\x02\x02\x1B?\x07\x16\x02\x02\x1C?\x07\"\x02\x02\x1D&\x07\x03" +
		"\x02\x02\x1E#\x05\x06\x04\x02\x1F \x07\x04\x02\x02 \"\x05\x06\x04\x02" +
		"!\x1F\x03\x02\x02\x02\"%\x03\x02\x02\x02#!\x03\x02\x02\x02#$\x03\x02\x02" +
		"\x02$\'\x03\x02\x02\x02%#\x03\x02\x02\x02&\x1E\x03\x02\x02\x02&\'\x03" +
		"\x02\x02\x02\'(\x03\x02\x02\x02(?\x07\x05\x02\x02)*\x07\x15\x02\x02*?" +
		"\x05\x06\x04\x13+,\x07\x14\x02\x02,?\x05\x06\x04\x12-.\x07\x06\x02\x02" +
		"./\x05\x06\x04\x02/0\x07\x07\x02\x020?\x03\x02\x02\x0212\x07\x17\x02\x02" +
		"23\x05\x06\x04\x0234\x07\x19\x02\x0245\x05\x06\x04\x0256\x07\x18\x02\x02" +
		"67\x05\x06\x04\x047?\x03\x02\x02\x0289\x07\x1B\x02\x029:\x05\n\x06\x02" +
		":;\x07\x1C\x02\x02;<\x05\b\x05\x02<=\x07\x1D\x02\x02=?\x03\x02\x02\x02" +
		">\x19\x03\x02\x02\x02>\x1B\x03\x02\x02\x02>\x1C\x03\x02\x02\x02>\x1D\x03" +
		"\x02\x02\x02>)\x03\x02\x02\x02>+\x03\x02\x02\x02>-\x03\x02\x02\x02>1\x03" +
		"\x02\x02\x02>8\x03\x02\x02\x02?f\x03\x02\x02\x02@A\f\x10\x02\x02AB\x07" +
		"\b\x02\x02Be\x05\x06\x04\x11CD\f\x0F\x02\x02DE\x07\t\x02\x02Ee\x05\x06" +
		"\x04\x10FG\f\x0E\x02\x02GH\x07\n\x02\x02He\x05\x06\x04\x0FIJ\f\r\x02\x02" +
		"JK\x07\v\x02\x02Ke\x05\x06\x04\x0ELM\f\f\x02\x02MN\x07\f\x02\x02Ne\x05" +
		"\x06\x04\rOP\f\v\x02\x02PQ\x07\r\x02\x02Qe\x05\x06\x04\fRS\f\n\x02\x02" +
		"ST\x07\x0F\x02\x02Te\x05\x06\x04\vUV\f\t\x02\x02VW\x07\x10\x02\x02We\x05" +
		"\x06\x04\nXY\f\b\x02\x02YZ\x07\x11\x02\x02Ze\x05\x06\x04\t[\\\f\x07\x02" +
		"\x02\\]\x07\x12\x02\x02]e\x05\x06\x04\b^_\f\x06\x02\x02_`\x07\x0E\x02" +
		"\x02`e\x05\x06\x04\x07ab\f\x05\x02\x02bc\x07\x13\x02\x02ce\x05\x06\x04" +
		"\x06d@\x03\x02\x02\x02dC\x03\x02\x02\x02dF\x03\x02\x02\x02dI\x03\x02\x02" +
		"\x02dL\x03\x02\x02\x02dO\x03\x02\x02\x02dR\x03\x02\x02\x02dU\x03\x02\x02" +
		"\x02dX\x03\x02\x02\x02d[\x03\x02\x02\x02d^\x03\x02\x02\x02da\x03\x02\x02" +
		"\x02eh\x03\x02\x02\x02fd\x03\x02\x02\x02fg\x03\x02\x02\x02g\x07\x03\x02" +
		"\x02\x02hf\x03\x02\x02\x02ij\x05\x06\x04\x02jk\x07\x1F\x02\x02km\x03\x02" +
		"\x02\x02li\x03\x02\x02\x02mn\x03\x02\x02\x02nl\x03\x02\x02\x02no\x03\x02" +
		"\x02\x02o\t\x03\x02\x02\x02pq\x05\f\x07\x02qr\x07\x1F\x02\x02rt\x03\x02" +
		"\x02\x02sp\x03\x02\x02\x02tu\x03\x02\x02\x02us\x03\x02\x02\x02uv\x03\x02" +
		"\x02\x02v\v\x03\x02\x02\x02wx\x07\x1A\x02\x02xy\x07\"\x02\x02yz\x07\x0E" +
		"\x02\x02z\x82\x05\x06\x04\x02{|\x07\x1E\x02\x02|}\x07\"\x02\x02}~\x05" +
		"\x0E\b\x02~\x7F\x07\x0E\x02\x02\x7F\x80\x05\x06\x04\x02\x80\x82\x03\x02" +
		"\x02\x02\x81w\x03\x02\x02\x02\x81{\x03\x02\x02\x02\x82\r\x03\x02\x02\x02" +
		"\x83\x84\t\x02\x02\x02\x84\x0F\x03\x02\x02\x02\f\x13\x17#&>dfnu\x81";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CalcParser.__ATN) {
			CalcParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CalcParser._serializedATN));
		}

		return CalcParser.__ATN;
	}

}

export class StartContext extends ParserRuleContext {
	public stmt(): StmtContext[];
	public stmt(i: number): StmtContext;
	public stmt(i?: number): StmtContext | StmtContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StmtContext);
		} else {
			return this.getRuleContext(i, StmtContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_start; }
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterStart) {
			listener.enterStart(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitStart) {
			listener.exitStart(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitStart) {
			return visitor.visitStart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StmtContext extends ParserRuleContext {
	public seqExpr(): SeqExprContext | undefined {
		return this.tryGetRuleContext(0, SeqExprContext);
	}
	public seqDecl(): SeqDeclContext | undefined {
		return this.tryGetRuleContext(0, SeqDeclContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_stmt; }
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterStmt) {
			listener.enterStmt(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitStmt) {
			listener.exitStmt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitStmt) {
			return visitor.visitStmt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class NumberContext extends ExpressionContext {
	public NUMBER(): TerminalNode { return this.getToken(CalcParser.NUMBER, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterNumber) {
			listener.enterNumber(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitNumber) {
			listener.exitNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BooleanContext extends ExpressionContext {
	public BOOLEAN(): TerminalNode { return this.getToken(CalcParser.BOOLEAN, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterBoolean) {
			listener.enterBoolean(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitBoolean) {
			listener.exitBoolean(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitBoolean) {
			return visitor.visitBoolean(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdentifierContext extends ExpressionContext {
	public ID(): TerminalNode { return this.getToken(CalcParser.ID, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterIdentifier) {
			listener.enterIdentifier(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitIdentifier) {
			listener.exitIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ListContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterList) {
			listener.enterList(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitList) {
			listener.exitList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitList) {
			return visitor.visitList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NegationContext extends ExpressionContext {
	public _operator!: Token;
	public _right!: ExpressionContext;
	public NEG(): TerminalNode { return this.getToken(CalcParser.NEG, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterNegation) {
			listener.enterNegation(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitNegation) {
			listener.exitNegation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitNegation) {
			return visitor.visitNegation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NotContext extends ExpressionContext {
	public _operator!: Token;
	public _right!: ExpressionContext;
	public NOT(): TerminalNode { return this.getToken(CalcParser.NOT, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterNot) {
			listener.enterNot(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitNot) {
			listener.exitNot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitNot) {
			return visitor.visitNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenthesesContext extends ExpressionContext {
	public _inner!: ExpressionContext;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterParentheses) {
			listener.enterParentheses(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitParentheses) {
			listener.exitParentheses(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitParentheses) {
			return visitor.visitParentheses(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PowerContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public POW(): TerminalNode { return this.getToken(CalcParser.POW, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterPower) {
			listener.enterPower(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitPower) {
			listener.exitPower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitPower) {
			return visitor.visitPower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MultiplicationContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public MUL(): TerminalNode { return this.getToken(CalcParser.MUL, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterMultiplication) {
			listener.enterMultiplication(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitMultiplication) {
			listener.exitMultiplication(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitMultiplication) {
			return visitor.visitMultiplication(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DivisionContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public DIV(): TerminalNode { return this.getToken(CalcParser.DIV, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterDivision) {
			listener.enterDivision(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitDivision) {
			listener.exitDivision(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitDivision) {
			return visitor.visitDivision(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AdditionContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public ADD(): TerminalNode { return this.getToken(CalcParser.ADD, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterAddition) {
			listener.enterAddition(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitAddition) {
			listener.exitAddition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitAddition) {
			return visitor.visitAddition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SubtractionContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public SUB(): TerminalNode { return this.getToken(CalcParser.SUB, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterSubtraction) {
			listener.enterSubtraction(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitSubtraction) {
			listener.exitSubtraction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitSubtraction) {
			return visitor.visitSubtraction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ModuloContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public MOD(): TerminalNode { return this.getToken(CalcParser.MOD, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterModulo) {
			listener.enterModulo(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitModulo) {
			listener.exitModulo(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitModulo) {
			return visitor.visitModulo(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class GreaterThanContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public GT(): TerminalNode { return this.getToken(CalcParser.GT, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterGreaterThan) {
			listener.enterGreaterThan(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitGreaterThan) {
			listener.exitGreaterThan(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitGreaterThan) {
			return visitor.visitGreaterThan(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class GreaterThanOrEqualContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public GTE(): TerminalNode { return this.getToken(CalcParser.GTE, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterGreaterThanOrEqual) {
			listener.enterGreaterThanOrEqual(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitGreaterThanOrEqual) {
			listener.exitGreaterThanOrEqual(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitGreaterThanOrEqual) {
			return visitor.visitGreaterThanOrEqual(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LessThanContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public LT(): TerminalNode { return this.getToken(CalcParser.LT, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterLessThan) {
			listener.enterLessThan(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitLessThan) {
			listener.exitLessThan(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitLessThan) {
			return visitor.visitLessThan(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LessThanOrEqualContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public LTE(): TerminalNode { return this.getToken(CalcParser.LTE, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterLessThanOrEqual) {
			listener.enterLessThanOrEqual(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitLessThanOrEqual) {
			listener.exitLessThanOrEqual(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitLessThanOrEqual) {
			return visitor.visitLessThanOrEqual(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class EqualContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public EQUAL(): TerminalNode { return this.getToken(CalcParser.EQUAL, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterEqual) {
			listener.enterEqual(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitEqual) {
			listener.exitEqual(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitEqual) {
			return visitor.visitEqual(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NequalContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _operator!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public NEQUAL(): TerminalNode { return this.getToken(CalcParser.NEQUAL, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterNequal) {
			listener.enterNequal(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitNequal) {
			listener.exitNequal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitNequal) {
			return visitor.visitNequal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConditionalContext extends ExpressionContext {
	public _pred!: ExpressionContext;
	public _cons!: ExpressionContext;
	public _alt!: ExpressionContext;
	public IF(): TerminalNode { return this.getToken(CalcParser.IF, 0); }
	public THEN(): TerminalNode { return this.getToken(CalcParser.THEN, 0); }
	public ELSE(): TerminalNode { return this.getToken(CalcParser.ELSE, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterConditional) {
			listener.enterConditional(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitConditional) {
			listener.exitConditional(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitConditional) {
			return visitor.visitConditional(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LocalDecContext extends ExpressionContext {
	public _decl!: SeqDeclContext;
	public _expr!: SeqExprContext;
	public LET(): TerminalNode { return this.getToken(CalcParser.LET, 0); }
	public IN(): TerminalNode { return this.getToken(CalcParser.IN, 0); }
	public END(): TerminalNode { return this.getToken(CalcParser.END, 0); }
	public seqDecl(): SeqDeclContext {
		return this.getRuleContext(0, SeqDeclContext);
	}
	public seqExpr(): SeqExprContext {
		return this.getRuleContext(0, SeqExprContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterLocalDec) {
			listener.enterLocalDec(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitLocalDec) {
			listener.exitLocalDec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitLocalDec) {
			return visitor.visitLocalDec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SeqExprContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public SEMIC(): TerminalNode[];
	public SEMIC(i: number): TerminalNode;
	public SEMIC(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CalcParser.SEMIC);
		} else {
			return this.getToken(CalcParser.SEMIC, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_seqExpr; }
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterSeqExpr) {
			listener.enterSeqExpr(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitSeqExpr) {
			listener.exitSeqExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitSeqExpr) {
			return visitor.visitSeqExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SeqDeclContext extends ParserRuleContext {
	public declaration(): DeclarationContext[];
	public declaration(i: number): DeclarationContext;
	public declaration(i?: number): DeclarationContext | DeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclarationContext);
		} else {
			return this.getRuleContext(i, DeclarationContext);
		}
	}
	public SEMIC(): TerminalNode[];
	public SEMIC(i: number): TerminalNode;
	public SEMIC(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CalcParser.SEMIC);
		} else {
			return this.getToken(CalcParser.SEMIC, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_seqDecl; }
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterSeqDecl) {
			listener.enterSeqDecl(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitSeqDecl) {
			listener.exitSeqDecl(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitSeqDecl) {
			return visitor.visitSeqDecl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_declaration; }
	public copyFrom(ctx: DeclarationContext): void {
		super.copyFrom(ctx);
	}
}
export class VarDecContext extends DeclarationContext {
	public _identifier!: Token;
	public _value!: ExpressionContext;
	public VAL(): TerminalNode { return this.getToken(CalcParser.VAL, 0); }
	public EQUAL(): TerminalNode { return this.getToken(CalcParser.EQUAL, 0); }
	public ID(): TerminalNode { return this.getToken(CalcParser.ID, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: DeclarationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterVarDec) {
			listener.enterVarDec(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitVarDec) {
			listener.exitVarDec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitVarDec) {
			return visitor.visitVarDec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FunDecContext extends DeclarationContext {
	public _identifier!: Token;
	public _params!: PatternContext;
	public _value!: ExpressionContext;
	public FUN(): TerminalNode { return this.getToken(CalcParser.FUN, 0); }
	public EQUAL(): TerminalNode { return this.getToken(CalcParser.EQUAL, 0); }
	public ID(): TerminalNode { return this.getToken(CalcParser.ID, 0); }
	public pattern(): PatternContext {
		return this.getRuleContext(0, PatternContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: DeclarationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterFunDec) {
			listener.enterFunDec(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitFunDec) {
			listener.exitFunDec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitFunDec) {
			return visitor.visitFunDec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PatternContext extends ParserRuleContext {
	public WILDC(): TerminalNode | undefined { return this.tryGetToken(CalcParser.WILDC, 0); }
	public ID(): TerminalNode | undefined { return this.tryGetToken(CalcParser.ID, 0); }
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(CalcParser.NUMBER, 0); }
	public BOOLEAN(): TerminalNode | undefined { return this.tryGetToken(CalcParser.BOOLEAN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CalcParser.RULE_pattern; }
	// @Override
	public enterRule(listener: CalcListener): void {
		if (listener.enterPattern) {
			listener.enterPattern(this);
		}
	}
	// @Override
	public exitRule(listener: CalcListener): void {
		if (listener.exitPattern) {
			listener.exitPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CalcVisitor<Result>): Result {
		if (visitor.visitPattern) {
			return visitor.visitPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


