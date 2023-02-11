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
	public static readonly NEQUAL = 10;
	public static readonly NOT = 11;
	public static readonly NEG = 12;
	public static readonly BOOLEAN = 13;
	public static readonly IF = 14;
	public static readonly ELSE = 15;
	public static readonly THEN = 16;
	public static readonly NUMBER = 17;
	public static readonly WHITESPACE = 18;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "POW", "MUL", "DIV", "ADD", "SUB", "MOD", "EQUAL", "NEQUAL", 
		"NOT", "NEG", "BOOLEAN", "IF", "ELSE", "THEN", "NUMBER", "WHITESPACE",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "'^'", "'*'", "'div'", "'+'", "'-'", "'mod'", 
		"'='", "'<>'", "'not'", "'~'", undefined, "'if'", "'else'", "'then'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, "POW", "MUL", "DIV", "ADD", "SUB", "MOD", 
		"EQUAL", "NEQUAL", "NOT", "NEG", "BOOLEAN", "IF", "ELSE", "THEN", "NUMBER", 
		"WHITESPACE",
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x14j\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12" +
		"\x04\x13\t\x13\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03" +
		"\t\x03\t\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03" +
		"\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x05\x0EP\n\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x12" +
		"\x06\x12`\n\x12\r\x12\x0E\x12a\x03\x13\x06\x13e\n\x13\r\x13\x0E\x13f\x03" +
		"\x13\x03\x13\x02\x02\x02\x14\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02" +
		"\x06\v\x02\x07\r\x02\b\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02" +
		"\r\x19\x02\x0E\x1B\x02\x0F\x1D\x02\x10\x1F\x02\x11!\x02\x12#\x02\x13%" +
		"\x02\x14\x03\x02\x04\x03\x022;\x05\x02\v\f\x0F\x0F\"\"\x02l\x02\x03\x03" +
		"\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03" +
		"\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02" +
		"\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02" +
		"\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02" +
		"\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02" +
		"\x02\x02\x02#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x03\'\x03\x02\x02\x02" +
		"\x05)\x03\x02\x02\x02\x07+\x03\x02\x02\x02\t-\x03\x02\x02\x02\v/\x03\x02" +
		"\x02\x02\r3\x03\x02\x02\x02\x0F5\x03\x02\x02\x02\x117\x03\x02\x02\x02" +
		"\x13;\x03\x02\x02\x02\x15=\x03\x02\x02\x02\x17@\x03\x02\x02\x02\x19D\x03" +
		"\x02\x02\x02\x1BO\x03\x02\x02\x02\x1DQ\x03\x02\x02\x02\x1FT\x03\x02\x02" +
		"\x02!Y\x03\x02\x02\x02#_\x03\x02\x02\x02%d\x03\x02\x02\x02\'(\x07*\x02" +
		"\x02(\x04\x03\x02\x02\x02)*\x07+\x02\x02*\x06\x03\x02\x02\x02+,\x07`\x02" +
		"\x02,\b\x03\x02\x02\x02-.\x07,\x02\x02.\n\x03\x02\x02\x02/0\x07f\x02\x02" +
		"01\x07k\x02\x0212\x07x\x02\x022\f\x03\x02\x02\x0234\x07-\x02\x024\x0E" +
		"\x03\x02\x02\x0256\x07/\x02\x026\x10\x03\x02\x02\x0278\x07o\x02\x0289" +
		"\x07q\x02\x029:\x07f\x02\x02:\x12\x03\x02\x02\x02;<\x07?\x02\x02<\x14" +
		"\x03\x02\x02\x02=>\x07>\x02\x02>?\x07@\x02\x02?\x16\x03\x02\x02\x02@A" +
		"\x07p\x02\x02AB\x07q\x02\x02BC\x07v\x02\x02C\x18\x03\x02\x02\x02DE\x07" +
		"\x80\x02\x02E\x1A\x03\x02\x02\x02FG\x07v\x02\x02GH\x07t\x02\x02HI\x07" +
		"w\x02\x02IP\x07g\x02\x02JK\x07h\x02\x02KL\x07c\x02\x02LM\x07n\x02\x02" +
		"MN\x07u\x02\x02NP\x07g\x02\x02OF\x03\x02\x02\x02OJ\x03\x02\x02\x02P\x1C" +
		"\x03\x02\x02\x02QR\x07k\x02\x02RS\x07h\x02\x02S\x1E\x03\x02\x02\x02TU" +
		"\x07g\x02\x02UV\x07n\x02\x02VW\x07u\x02\x02WX\x07g\x02\x02X \x03\x02\x02" +
		"\x02YZ\x07v\x02\x02Z[\x07j\x02\x02[\\\x07g\x02\x02\\]\x07p\x02\x02]\"" +
		"\x03\x02\x02\x02^`\t\x02\x02\x02_^\x03\x02\x02\x02`a\x03\x02\x02\x02a" +
		"_\x03\x02\x02\x02ab\x03\x02\x02\x02b$\x03\x02\x02\x02ce\t\x03\x02\x02" +
		"dc\x03\x02\x02\x02ef\x03\x02\x02\x02fd\x03\x02\x02\x02fg\x03\x02\x02\x02" +
		"gh\x03\x02\x02\x02hi\b\x13\x02\x02i&\x03\x02\x02\x02\x06\x02Oaf\x03\b" +
		"\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CalcLexer.__ATN) {
			CalcLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CalcLexer._serializedATN));
		}

		return CalcLexer.__ATN;
	}

}

