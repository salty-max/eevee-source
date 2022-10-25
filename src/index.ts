/**
 * Eevee interpreter.
 *
 * (C) 2022-present Maxime Blanc <max@jellycat.fr>
 */
import readline from "readline";
import yargs from "yargs";
import { Expr } from "./Expr";

import { Interpreter } from "./Interpreter";
import Parser from "./Parser";
import RuntimeError from "./RuntimeError";
import Scanner from "./Scanner";
import { Stmt } from "./Stmt";
import Token from "./Token";
import TokenType from "./TokenType";

const fs = require("fs");

export class Eevee {
  private static readonly interpreter = new Interpreter();
  private static hadError = false;

  public static main(): number {
    const args = yargs(process.argv.slice(2))
      .usage("$0 <mode>")
      .command("eevee", "Eevee interpreter.")
      .option("mode", {
        describe: "Mode to run",
        alias: "m",
        type: "string",
      })
      .option("filepath", {
        describe: "Path to file to interpret",
        alias: "f",
        type: "string",
      })
      .option("expression", {
        describe: "Expression to interpret",
        alias: "e",
        type: "string",
      })
      .help()
      .alias("help", "h")
      .parseSync();

    // REPL mode.
    if (args.mode === "int") {
      this.runREPL();
    }

    // Expression mode.
    if (args.mode === "expr" && args.expression) {
      this.runExpr(args.expression);
    }

    // File read mode.
    if (args.mode === "file" && args.filepath) {
      this.runFile(args.filepath.toString());
    }

    return 0;
  }

  private static runFile(path: string): void {
    const src = fs.readFileSync(path, "utf-8");
    this.greet("-------- Eevee 0.1 --------");
    this.run(src);

    // Indicate an error in the exit code.
    if (this.hadError) process.exit(70);
  }

  private static runExpr(source: string): void {
    this.greet("-------- Eevee 0.1 --------");
    this.run(source);

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
      this.hadError = false;
      this.run(line);

      rl.prompt();
    }).on("close", () => {
      this.greet("👋   Goodbye!");
      process.exit(0);
    });
  }

  private static run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const syntax = parser.parseREPL();
    if (this.hadError) return;

    if (syntax instanceof Array<Stmt>) {
      this.interpreter.interpretStmt(syntax as Array<Stmt>);
    } else {
      const result = this.interpreter.interpret(syntax as Expr);
      if (result) {
        Eevee.log(`= ${result}`);
      }
    }
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

  static runtimeError(error: RuntimeError): void {
    console.error(
      `\x1B[1m\x1b[31mRuntime error -> (${error.token.line} : ${error.token.column})\n${error.message}\x1b[0m`
    );
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

Eevee.main();

export default Eevee;
