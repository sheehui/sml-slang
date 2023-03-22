grammar SmlSlang;

/*
 * Tokens (terminal)
 */
CONCAT: '^';
MUL: '*';
HASH: '#';
DCOLON: '::';
AMPERSAND: '@';
DIV: 'div';
ADD: '+';
SUB: '-';
MOD: 'mod';
EQUAL: '=';
GT: '>';
GTE: '>=';
LT: '<';
LTE: '<=';
NEQUAL: '<>';
NOT: 'not';
NEG: '~'; 
BOOLEAN
   : 'true' 
   | 'false'
   ; 
IF: 'if'; 
ELSE: 'else';
THEN: 'then'; 
VAL: 'val'; 
LET: 'let'; 
LOCAL: 'local'; 
IN: 'in'; 
END: 'end'; 
FUN: 'fun';
FN: 'fn'; 
LAMARR: '=>'; 
TYPARR: '->'; 
SEMIC: ';'; 
WILDC: '_'; 
NIL: 'nil'; 
REC: 'rec'; 
NUMBER: DIGIT+;
TUPLE_ACCESS: HASH [1-9] DIGIT*;
STRING: '"' (~["])+ '"';
TYPE: 'int' | 'bool' | 'string' | 'list'; 
ID: [a-zA-Z] ([a-zA-Z] | [0-9] | '\'' | '_' )*;
WHITESPACE: [ \r\n\t]+ -> skip;

fragment DIGIT: [0-9];

/*
 * Productions
 */
start : (stmt)+;

stmt 
   : seqExpr 
   | seqDecl
   ; 

expression
   : (ID | TYPE)                                                                  # Identifier
   | STRING                                                                       # String
   | NUMBER                                                                       # Number
   | BOOLEAN                                                                      # Boolean
   | NIL                                                                          # Nil

   | FN params=pattern LAMARR (expression)                                        # FuncExpr
   | callee=expression '(' ( expression ( ',' expression )* )? ')'                # FuncApp

   | '(' inner=expression ')'                                                     # Parentheses
   
   | '(' ( expression ( ',' expression )* )? ')'                                  # Tuple
   | '[' ( expression ( ',' expression )* )? ']'                                  # List

   | operator=NEG right=expression                                                # Negation
   | left=expression operator=(MUL | DIV | MOD) right=expression                  # Factor
   | left=expression operator=(ADD | SUB) right=expression                        # AddSub
   
   | left=expression operator=CONCAT right=expression                             # Concat

   | operator=NOT right=expression                                                # Not
   | left=expression operator=(GT | GTE | LT | LTE) right=expression              # Inequality
   | left=expression operator=(EQUAL | NEQUAL) right=expression                   # Equality

   | <assoc=right> left=expression operator=(DCOLON | AMPERSAND) right=expression # ListOps

   | IF pred=expression THEN cons=expression ELSE alt=expression                  # Conditional
   | LET decl=seqDecl IN expr=seqExpr END                                         # LocalDec

   | record=TUPLE_ACCESS expr=expression                                          # TupleAccess
   ;

seqExpr
   : (expression SEMIC)+
   ;

seqDecl
   : (declaration SEMIC)+
   ;

declaration
   : VAL REC? identifier=pattern EQUAL value=expression           # VarDec
   | FUN identifier=ID params=pattern EQUAL value=expression      # FunDec
   | LOCAL localDecs=seqDecl IN decs=seqDecl END                  # LocalDecs
   ;

type 
   : TYPE                                                         # LitType
   | listType=type TYPE                                           # ListType 
   | '(' inner=type ')'                                           # TypeParens
   | left=type MUL right=type                                     # TupleType
   | left=type TYPARR right=type                                  # FuncType
   ;

pattern
   : WILDC (':' valType=type)?                                    # PattWildc
   | (ID | TYPE) (':' valType=type)?                              # PattId
   | NUMBER (':' valType=type)?                                   # PattNum
   | BOOLEAN (':' valType=type)?                                  # PattBool
   | '(' ( pattern ( ',' pattern )* )? ')'                        # PattTuple
   ; 