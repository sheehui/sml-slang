grammar SmlSlang;

/*
 * Tokens (terminal)
 */
POW: '^';
MUL: '*';
HASH: '#';
APPEND: '::';
MERGE: '@';
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
WHILE: 'while';
DO: 'do';
SEMIC: ';'; 
WILDC: '_'; 
NIL: 'nil'; 
REC: 'rec'; 
NUMBER: DIGIT+;
TUPLE_ACCESS: HASH [1-9] DIGIT*;
STRING: '"' (~["])+ '"';
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
   : ID                                                           # Identifier
   | STRING                                                       # String
   | NUMBER                                                       # Number
   | BOOLEAN                                                      # Boolean
   | NIL                                                          # Nil

   | FN params=pattern LAMARR (expression)                          # FuncExpr
   | callee=expression '(' ( expression ( ',' expression )* )? ')'        # FuncApp
   | '(' inner=expression ')'                                     # Parentheses
   | '(' ( expression ( ',' expression )* )? ')'                  # Tuple
   | record=TUPLE_ACCESS expr=expression                          # TupleAccess

   | '[' ( expression ( ',' expression )* )? ']'                  # List
   | expression (APPEND expression)+                              # Append
   | expression (MERGE expression)+                               # Merge

   | operator=NEG right=expression                                # Negation
   | operator=NOT right=expression                                # Not

   | left=expression operator=POW right=expression                # Power
   | left=expression operator=MUL right=expression                # Multiplication
   | left=expression operator=DIV right=expression                # Division
   | left=expression operator=ADD right=expression                # Addition
   | left=expression operator=SUB right=expression                # Subtraction
   | left=expression operator=MOD right=expression                # Modulo
   
   | left=expression operator=GT right=expression                 # GreaterThan
   | left=expression operator=GTE right=expression                # GreaterThanOrEqual
   | left=expression operator=LT right=expression                 # LessThan
   | left=expression operator=LTE right=expression                # LessThanOrEqual 
   | left=expression operator=EQUAL right=expression              # Equal
   | left=expression operator=NEQUAL right=expression             # Nequal

   | IF pred=expression THEN cons=expression ELSE alt=expression  # Conditional
   | LET decl=seqDecl IN expr=seqExpr END                         # LocalDec
   ;

seqExpr
   : (expression SEMIC)+
   ;

seqDecl
   : (declaration SEMIC)+
   ;

declaration
   : VAL REC?  identifier=ID EQUAL value=expression                     # VarDec
   | FUN identifier=ID params=pattern EQUAL value=expression      # FunDec
   | LOCAL localDecs=seqDecl IN decs=seqDecl END                  # LocalDecs
   ;

pattern
   : WILDC                                                        # PattWildc
   | ID                                                           # PattId
   | NUMBER                                                       # PattNum
   | BOOLEAN                                                      # PattBool
   | '(' ( pattern ( ',' pattern )* )? ')'                        # PattTuple
   ; 