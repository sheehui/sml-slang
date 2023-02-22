grammar Calc;

/*
 * Tokens (terminal)
 */
POW: '^';
MUL: '*';
DIV: 'div';
ADD: '+';
SUB: '-';
MOD: 'mod';
EQUAL: '=';
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
NUMBER: [0-9]+;
ID: [a-zA-Z] ([a-zA-Z] | [0-9] | '\'' | '_' )*;
WHITESPACE: [ \r\n\t]+ -> skip;

/*
 * Productions
 */
start : (stmt ';')+;

stmt 
   : expression 
   | declaration
   ; 

expression
   : NUMBER                                         # Number
   | BOOLEAN                                        # Boolean

   | ID                                             # Identifier

   | operator=NEG right=expression                  # Negation
   | operator=NOT right=expression                  # Not

   | '(' inner=expression ')'                       # Parentheses
   | left=expression operator=POW right=expression  # Power
   | left=expression operator=MUL right=expression  # Multiplication
   | left=expression operator=DIV right=expression  # Division
   | left=expression operator=ADD right=expression  # Addition
   | left=expression operator=SUB right=expression  # Subtraction
   | left=expression operator=MOD right=expression  # Modulo
   
   | left=expression operator=EQUAL right=expression  # Equal
   | left=expression operator=NEQUAL right=expression  # Nequal

   | IF pred=expression THEN cons=expression ELSE alt=expression  # Conditional
   ;

declaration
   : VAL identifier=ID '=' value=expression       # VarDec
   ;