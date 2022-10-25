import Eevee from ".";
import Token from "./Token";
import TokenType from "./TokenType";

class Scanner {
  private readonly source: string;
  private readonly tokens: Array<Token> = new Array<Token>();
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Array<Token> {
    while (!this.isAtEnd()) {
      // Beginning of the next lexeme.
      this.start = this.current;
      this.scanToken();
    }

    this.addToken(TokenType.EOF);
    return this.tokens;
  }

  private scanToken(): void {
    const c: string = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "%":
        this.addToken(TokenType.PERCENT);
        break;
      case "?":
        this.addToken(TokenType.QUESTION_MARK);
        break;
      case ":":
        this.addToken(TokenType.COLUMN);
        break;
      case "-":
        if (this.match("-")) {
          this.addToken(TokenType.MINUS_MINUS);
        } else if (this.match("=")) {
          this.addToken(TokenType.MINUS_EQUAL);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case "+":
        if (this.match("+")) {
          this.addToken(TokenType.PLUS_PLUS);
        } else if (this.match("=")) {
          this.addToken(TokenType.PLUS_EQUAL);
        } else {
          this.addToken(TokenType.PLUS);
        }
        break;
      case "*":
        this.addToken(this.match("=") ? TokenType.STAR_EQUAL : TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          while (
            this.peek() != "*" &&
            this.peekNext() != "/" &&
            !this.isAtEnd()
          ) {
            if (this.peek() === "\n") this.line++;
            this.advance();
          }

          this.advance();
          this.advance();
        } else if (this.match("=")) {
          this.addToken(TokenType.SLASH_EQUAL);
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Eevee.error(this.line, this.start, "Unexpected character.");
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text: string = this.source.substring(this.start, this.current);
    let type: TokenType = Scanner.keywords.get(text)!;

    if (!type) type = TokenType.IDENTIFIER;

    this.addToken(type);
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the '.'.
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Eevee.error(this.line, this.start, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }

    return this.source.charAt(this.current + 1);
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z_]+/.test(c);
  }

  private isDigit(c: string): boolean {
    return /[0-9]+/.test(c);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private addToken(type: TokenType): void;
  private addToken(type: TokenType, literal: any): void;
  private addToken(type: TokenType, literal?: any): void {
    const text: string = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, literal ?? null, this.line, this.current)
    );
  }

  private static keywords: Map<string, TokenType>;

  static {
    this.keywords = new Map<string, TokenType>();
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("class", TokenType.CLASS);
    this.keywords.set("def", TokenType.DEF);
    this.keywords.set("do", TokenType.DO);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("end", TokenType.END);
    this.keywords.set("false", TokenType.FALSE);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("lambda", TokenType.LAMBDA);
    this.keywords.set("let", TokenType.LET);
    this.keywords.set("match", TokenType.MATCH);
    this.keywords.set("nil", TokenType.NIL);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("return", TokenType.RETURN);
    this.keywords.set("self", TokenType.SELF);
    this.keywords.set("super", TokenType.SUPER);
    this.keywords.set("then", TokenType.THEN);
    this.keywords.set("true", TokenType.TRUE);
    this.keywords.set("while", TokenType.WHILE);
  }
}

export default Scanner;
