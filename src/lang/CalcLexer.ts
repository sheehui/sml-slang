// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class CalcLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly POW = 3;
	public static readonly MUL = 4;
	public static readonly DIV = 5;
	public static readonly ADD = 6;
	public static readonly SUB = 7;
	public static readonly MOD = 8;
	public static readonly EQUAL = 9;
	public static readonly GT = 10;
	public static readonly GTE = 11;
	public static readonly LT = 12;
	public static readonly LTE = 13;
	public static readonly NEQUAL = 14;
	public static readonly NOT = 15;
	public static readonly NEG = 16;
	public static readonly BOOLEAN = 17;
	public static readonly IF = 18;
	public static readonly ELSE = 19;
	public static readonly THEN = 20;
	public static readonly VAL = 21;
	public static readonly LET = 22;
	public static readonly IN = 23;
	public static readonly END = 24;
	public static readonly FUN = 25;
	public static readonly SEMIC = 26;
	public static readonly WILDC = 27;
	public static readonly NUMBER = 28;
	public static readonly ID = 29;
	public static readonly WHITESPACE = 30;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "POW", "MUL", "DIV", "ADD", "SUB", "MOD", "EQUAL", "GT", 
		"GTE", "LT", "LTE", "NEQUAL", "NOT", "NEG", "BOOLEAN", "IF", "ELSE", "THEN", 
		"VAL", "LET", "IN", "END", "FUN", "SEMIC", "WILDC", "NUMBER", "ID", "WHITESPACE",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "'^'", "'*'", "'div'", "'+'", "'-'", "'mod'", 
		"'='", "'>'", "'>='", "'<'", "'<='", "'<>'", "'not'", "'~'", undefined, 
		"'if'", "'else'", "'then'", "'val'", "'let'", "'in'", "'end'", "'fun'", 
		"';'", "'_'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, "POW", "MUL", "DIV", "ADD", "SUB", "MOD", 
		"EQUAL", "GT", "GTE", "LT", "LTE", "NEQUAL", "NOT", "NEG", "BOOLEAN", 
		"IF", "ELSE", "THEN", "VAL", "LET", "IN", "END", "FUN", "SEMIC", "WILDC", 
		"NUMBER", "ID", "WHITESPACE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CalcLexer._LITERAL_NAMES, CalcLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CalcLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(CalcLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "Calc.g4"; }

	// @Override
	public get ruleNames(): string[] { return CalcLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return CalcLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return CalcLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return CalcLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02 \xAA\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12" +
		"\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17" +
		"\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C" +
		"\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x03\x02\x03\x02\x03\x03\x03" +
		"\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\n\x03\n\x03\v\x03" +
		"\v\x03\f\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12r\n\x12" +
		"\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x15" +
		"\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16\x03\x17" +
		"\x03\x17\x03\x17\x03\x17\x03\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x03\x1C" +
		"\x03\x1D\x06\x1D\x99\n\x1D\r\x1D\x0E\x1D\x9A\x03\x1E\x03\x1E\x07\x1E\x9F" +
		"\n\x1E\f\x1E\x0E\x1E\xA2\v\x1E\x03\x1F\x06\x1F\xA5\n\x1F\r\x1F\x0E\x1F" +
		"\xA6\x03\x1F\x03\x1F\x02\x02\x02 \x03\x02\x03\x05\x02\x04\x07\x02\x05" +
		"\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17" +
		"\x02\r\x19\x02\x0E\x1B\x02\x0F\x1D\x02\x10\x1F\x02\x11!\x02\x12#\x02\x13" +
		"%\x02\x14\'\x02\x15)\x02\x16+\x02\x17-\x02\x18/\x02\x191\x02\x1A3\x02" +
		"\x1B5\x02\x1C7\x02\x1D9\x02\x1E;\x02\x1F=\x02 \x03\x02\x06\x03\x022;\x04" +
		"\x02C\\c|\x07\x02))2;C\\aac|\x05\x02\v\f\x0F\x0F\"\"\x02\xAD\x02\x03\x03" +
		"\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03" +
		"\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02" +
		"\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02" +
		"\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02" +
		"\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02" +
		"\x02\x02\x02#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02" +
		"\x02)\x03\x02\x02\x02\x02+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03" +
		"\x02\x02\x02\x021\x03\x02\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02" +
		"\x02\x027\x03\x02\x02\x02\x029\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x02" +
		"=\x03\x02\x02\x02\x03?\x03\x02\x02\x02\x05A\x03\x02\x02\x02\x07C\x03\x02" +
		"\x02\x02\tE\x03\x02\x02\x02\vG\x03\x02\x02\x02\rK\x03\x02\x02\x02\x0F" +
		"M\x03\x02\x02\x02\x11O\x03\x02\x02\x02\x13S\x03\x02\x02\x02\x15U\x03\x02" +
		"\x02\x02\x17W\x03\x02\x02\x02\x19Z\x03\x02\x02\x02\x1B\\\x03\x02\x02\x02" +
		"\x1D_\x03\x02\x02\x02\x1Fb\x03\x02\x02\x02!f\x03\x02\x02\x02#q\x03\x02" +
		"\x02\x02%s\x03\x02\x02\x02\'v\x03\x02\x02\x02){\x03\x02\x02\x02+\x80\x03" +
		"\x02\x02\x02-\x84\x03\x02\x02\x02/\x88\x03\x02\x02\x021\x8B\x03\x02\x02" +
		"\x023\x8F\x03\x02\x02\x025\x93\x03\x02\x02\x027\x95\x03\x02\x02\x029\x98" +
		"\x03\x02\x02\x02;\x9C\x03\x02\x02\x02=\xA4\x03\x02\x02\x02?@\x07*\x02" +
		"\x02@\x04\x03\x02\x02\x02AB\x07+\x02\x02B\x06\x03\x02\x02\x02CD\x07`\x02" +
		"\x02D\b\x03\x02\x02\x02EF\x07,\x02\x02F\n\x03\x02\x02\x02GH\x07f\x02\x02" +
		"HI\x07k\x02\x02IJ\x07x\x02\x02J\f\x03\x02\x02\x02KL\x07-\x02\x02L\x0E" +
		"\x03\x02\x02\x02MN\x07/\x02\x02N\x10\x03\x02\x02\x02OP\x07o\x02\x02PQ" +
		"\x07q\x02\x02QR\x07f\x02\x02R\x12\x03\x02\x02\x02ST\x07?\x02\x02T\x14" +
		"\x03\x02\x02\x02UV\x07@\x02\x02V\x16\x03\x02\x02\x02WX\x07@\x02\x02XY" +
		"\x07?\x02\x02Y\x18\x03\x02\x02\x02Z[\x07>\x02\x02[\x1A\x03\x02\x02\x02" +
		"\\]\x07>\x02\x02]^\x07?\x02\x02^\x1C\x03\x02\x02\x02_`\x07>\x02\x02`a" +
		"\x07@\x02\x02a\x1E\x03\x02\x02\x02bc\x07p\x02\x02cd\x07q\x02\x02de\x07" +
		"v\x02\x02e \x03\x02\x02\x02fg\x07\x80\x02\x02g\"\x03\x02\x02\x02hi\x07" +
		"v\x02\x02ij\x07t\x02\x02jk\x07w\x02\x02kr\x07g\x02\x02lm\x07h\x02\x02" +
		"mn\x07c\x02\x02no\x07n\x02\x02op\x07u\x02\x02pr\x07g\x02\x02qh\x03\x02" +
		"\x02\x02ql\x03\x02\x02\x02r$\x03\x02\x02\x02st\x07k\x02\x02tu\x07h\x02" +
		"\x02u&\x03\x02\x02\x02vw\x07g\x02\x02wx\x07n\x02\x02xy\x07u\x02\x02yz" +
		"\x07g\x02\x02z(\x03\x02\x02\x02{|\x07v\x02\x02|}\x07j\x02\x02}~\x07g\x02" +
		"\x02~\x7F\x07p\x02\x02\x7F*\x03\x02\x02\x02\x80\x81\x07x\x02\x02\x81\x82" +
		"\x07c\x02\x02\x82\x83\x07n\x02\x02\x83,\x03\x02\x02\x02\x84\x85\x07n\x02" +
		"\x02\x85\x86\x07g\x02\x02\x86\x87\x07v\x02\x02\x87.\x03\x02\x02\x02\x88" +
		"\x89\x07k\x02\x02\x89\x8A\x07p\x02\x02\x8A0\x03\x02\x02\x02\x8B\x8C\x07" +
		"g\x02\x02\x8C\x8D\x07p\x02\x02\x8D\x8E\x07f\x02\x02\x8E2\x03\x02\x02\x02" +
		"\x8F\x90\x07h\x02\x02\x90\x91\x07w\x02\x02\x91\x92\x07p\x02\x02\x924\x03" +
		"\x02\x02\x02\x93\x94\x07=\x02\x02\x946\x03\x02\x02\x02\x95\x96\x07a\x02" +
		"\x02\x968\x03\x02\x02\x02\x97\x99\t\x02\x02\x02\x98\x97\x03\x02\x02\x02" +
		"\x99\x9A\x03\x02\x02\x02\x9A\x98\x03\x02\x02\x02\x9A\x9B\x03\x02\x02\x02" +
		"\x9B:\x03\x02\x02\x02\x9C\xA0\t\x03\x02\x02\x9D\x9F\t\x04\x02\x02\x9E" +
		"\x9D\x03\x02\x02\x02\x9F\xA2\x03\x02\x02\x02\xA0\x9E\x03\x02\x02\x02\xA0" +
		"\xA1\x03\x02\x02\x02\xA1<\x03\x02\x02\x02\xA2\xA0\x03\x02\x02\x02\xA3" +
		"\xA5\t\x05\x02\x02\xA4\xA3\x03\x02\x02\x02\xA5\xA6\x03\x02\x02\x02\xA6" +
		"\xA4\x03\x02\x02\x02\xA6\xA7\x03\x02\x02\x02\xA7\xA8\x03\x02\x02\x02\xA8" +
		"\xA9\b\x1F\x02\x02\xA9>\x03\x02\x02\x02\b\x02q\x9A\x9E\xA0\xA6\x03\b\x02" +
		"\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CalcLexer.__ATN) {
			CalcLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CalcLexer._serializedATN));
		}

		return CalcLexer.__ATN;
	}

}

