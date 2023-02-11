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
NUMBER: [0-9]+;
WHITESPACE: [ \r\n\t]+ -> skip;

/*
 * Productions
 */
start : expression;

expression
   : NUMBER                                         # Number
   | BOOLEAN                                        # Boolean

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
   ;