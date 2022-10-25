import TokenType from "./TokenType";

class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: any;
  readonly line: number;
  readonly column: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: any,
    line: number,
    column: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
    this.column = column;
  }

  public toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export default Token;
