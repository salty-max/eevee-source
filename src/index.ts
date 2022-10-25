/**
 * Eevee interpreter.
 *
 * (C) 2022-present Maxime Blanc <max@jellycat.fr>
 */

import readline from "readline";

import AstPrinter from "./AstPrinter";
import Parser from "./Parser";
import Scanner from "./Scanner";
import Token from "./Token";
import TokenType from "./TokenType";

const fs = require("fs");

class Eevee {
  private static hadError: boolean = false;

  public static main(argv: Array<string>): number {
    const [_node, _path, mode, path] = argv;

    if (argv.length <= 2) {
      console.log("Usage: eevee --help");
      process.exit(64);
    }

    // REPL mode.
    if (mode === "-e") {
      this.runREPL();
    }

    // File read mode.
    if (mode === "-f" && path) {
      this.runFile(path);
    }

    if (mode === "--help") {
      console.log("\x1B[1m\x1b[34m-------- Eevee --------\x1b[0m\n");
      console.log("-e : REPL mode\n");
      console.log("-f [path] : File reader mode\n");
    }

    return 0;
  }

  private static runFile(path: string): void {
    const src = fs.readFileSync(path, "utf-8");
    this.run(src);

    // Indicate an error in the exit code.
    if (this.hadError) process.exit(70);
  }

  private static runREPL(): void {
    this.greet("-------- Eevee 0.1 --------");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", (line) => {
      this.run(line);
      this.hadError = false;

      rl.prompt();
    }).on("close", () => {
      this.greet("👋   Goodbye!");
      process.exit(0);
    });
  }

  private static run(source: string): void {
    const scanner: Scanner = new Scanner(source);
    const tokens: Array<Token> = scanner.scanTokens();
    const parser: Parser = new Parser(tokens);
    const expression = parser.parse();

    expression && console.log(new AstPrinter().print(expression).toString());
  }

  static log(message: string): void {
    console.log(`\x1B[1m\x1b[34m${message}\x1b[0m`);
  }

  static greet(message: string): void {
    console.log(`\x1B[1m\x1b[32m${message}\x1b[0m`);
  }

  static error(line: number, column: number, message: string): void {
    this.report(line, column, "", message);
  }

  static parseError(token: Token, column: number, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, column, " at end", message);
    } else {
      this.report(token.line, column, ` at '${token.lexeme}'`, message);
    }
  }

  static report(
    line: number,
    column: number,
    where: string,
    message: string
  ): void {
    console.error(
      `\x1B[1m\x1b[31mError${where} (${line}:${column}): ${message}\x1b[0m`
    );
  }
}

Eevee.main(process.argv);

export default Eevee;
