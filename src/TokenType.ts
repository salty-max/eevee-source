enum TokenType {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  SEMICOLON,
  QUESTION_MARK,
  COLUMN,

  // One or two character tokens.
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  PLUS,
  PLUS_EQUAL,
  PLUS_PLUS,
  MINUS,
  MINUS_EQUAL,
  MINUS_MINUS,
  STAR,
  STAR_EQUAL,
  SLASH,
  SLASH_EQUAL,
  PERCENT,
  PERCENT_EQUAL,

  // Literals.
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords.
  AND,
  CLASS,
  DEF,
  DO,
  ELSE,
  END,
  FALSE,
  FOR,
  IF,
  LET,
  LAMBDA,
  MATCH,
  NIL,
  OR,
  PRINT,
  RETURN,
  SELF,
  SUPER,
  THEN,
  TRUE,
  WHILE,

  // Misc.
  EOF,
}

export default TokenType;
