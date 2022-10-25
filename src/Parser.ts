import Eevee from ".";
import {
  Assign,
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
  Variable,
} from "./Expr";
import { Block, Expression, Print, Stmt, Var } from "./Stmt";
import Token from "./Token";
import TokenType from "./TokenType";

class ParseError extends Error {}

class Parser {
  private readonly tokens: Array<Token>;
  private current: number = 0;
  private allowExpression: boolean = false;
  private foundExpression: boolean = false;

  constructor(tokens: Array<Token>) {
    this.tokens = tokens;
  }

  parse() {
    const statements = new Array<Stmt | null>();
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  parseREPL() {
    this.allowExpression = true;

    const statements = new Array<Stmt | null>();
    while (!this.isAtEnd()) {
      statements.push(this.declaration());

      if (this.foundExpression) {
        const last = statements[statements.length - 1];
        return (last as Expression).expression;
      }

      this.allowExpression = false;
    }

    return statements;
  }

  private declaration() {
    try {
      if (this.match(TokenType.LET)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      if (error instanceof ParseError) this.synchronize();
      return null;
    }
  }

  private statement() {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }

    if (this.match(TokenType.DO)) {
      return new Block(this.block());
    }

    return this.expressionStatement();
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();

    if (this.allowExpression && this.isAtEnd()) {
      this.foundExpression = true;
    } else {
      this.consume(TokenType.SEMICOLON, "Expect ':' after expression.");
    }

    return new Expression(expr);
  }

  private block() {
    const statements = new Array<Stmt | null>();

    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.END, "Expect 'end' after block.");
    return statements;
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    let initializer = null;

    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Var(name, initializer);
  }

  private expression(): any {
    return this.assignment();
  }

  private assignment(): any {
    let expr = this.conditional();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = (expr as Variable).name;
        return new Assign(name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private conditional(): any {
    let expr = this.equality();

    if (this.match(TokenType.QUESTION_MARK)) {
      const consequent = this.equality();

      this.consume(TokenType.COLUMN, "Expect ':' after expression.");

      const alternate = this.conditional();

      expr = new Conditional(expr, consequent, alternate);
    }

    return expr;
  }

  private equality(): any {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): any {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): any {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): any {
    let expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): any {
    if (this.match(TokenType.MINUS, TokenType.BANG)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.postfix();
  }

  private postfix(): any {
    let expr = this.primary();

    if (this.match(TokenType.MINUS_MINUS, TokenType.PLUS_PLUS)) {
      const operator = this.previous();
      return new Postfix(expr, operator);
    }

    return expr;
  }

  private primary(): any {
    if (this.match(TokenType.IDENTIFIER)) return new Variable(this.previous());
    if (this.match(TokenType.FALSE)) return new LiteralBoolean(false);
    else if (this.match(TokenType.TRUE)) return new LiteralBoolean(true);
    else if (this.match(TokenType.NIL)) return new LiteralNull(null);
    else if (this.match(TokenType.NUMBER))
      return new LiteralNumber(this.previous().literal);
    else if (this.match(TokenType.STRING))
      return new LiteralString(this.previous().literal);
    else if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
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

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek() {
    return this.tokens[this.current];
  }

  private previous() {
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
