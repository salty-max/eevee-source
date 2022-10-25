import Eevee from ".";
import {
  Binary,
  Conditional,
  Expr,
  Grouping,
  LiteralBoolean,
  LiteralNull,
  LiteralNumber,
  LiteralString,
  Postfix,
  Unary,
} from "./Expr";
import Token from "./Token";
import TokenType from "./TokenType";

class ParseError extends Error {}

class Parser {
  private readonly tokens: Array<Token>;
  private current: number = 0;

  constructor(tokens: Array<Token>) {
    this.tokens = tokens;
  }

  parse(): Expr | null {
    try {
      return this.expression();
    } catch (error: any) {
      return null;
    }
  }

  private expression(): Expr {
    return this.conditional();
  }

  private conditional(): Expr {
    let expr: Expr = this.equality();

    if (this.match(TokenType.QUESTION_MARK)) {
      const consequent: Expr = this.equality();

      this.consume(TokenType.COLUMN, "Expect ':' after expression.");

      const alternate: Expr = this.conditional();

      expr = new Conditional(expr, consequent, alternate);
    }

    return expr;
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr: Expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.MINUS, TokenType.BANG)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }

    return this.postfix();
  }

  private postfix(): Expr {
    let expr: Expr = this.primary();

    if (this.match(TokenType.MINUS_MINUS, TokenType.PLUS_PLUS)) {
      const operator: Token = this.previous();
      return new Postfix(expr, operator);
    }

    return expr;
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new LiteralBoolean(false);
    else if (this.match(TokenType.TRUE)) return new LiteralBoolean(true);
    else if (this.match(TokenType.NIL)) return new LiteralNull(null);
    else if (this.match(TokenType.NUMBER))
      return new LiteralNumber(this.previous().literal);
    else if (this.match(TokenType.STRING))
      return new LiteralString(this.previous().literal);
    else if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    } else throw this.error(this.peek(), "Expect expression.");
  }

  private match(...types: Array<TokenType>): boolean {
    for (let i = 0; i < types.length; i++) {
      if (this.check(types[i])) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  private error(token: Token, message: string): ParseError {
    Eevee.parseError(token, this.current, message);
    return new ParseError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;
    }

    switch (this.peek().type) {
      case TokenType.CLASS:
      case TokenType.DEF:
      case TokenType.IF:
      case TokenType.FOR:
      case TokenType.LAMBDA:
      case TokenType.MATCH:
      case TokenType.PRINT:
      case TokenType.RETURN:
      case TokenType.LET:
      case TokenType.WHILE:
        return;
      default:
        break;
    }

    this.advance();
  }
}

export default Parser;
