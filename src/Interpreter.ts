import { Eevee } from ".";
import Environment from "./Environment";
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
  Logical,
  Postfix,
  Unary,
  Variable,
  Visitor,
} from "./Expr";
import RuntimeError from "./RuntimeError";
import { Block, Expression, If, Print, Stmt, Var, While } from "./Stmt";
import Token from "./Token";
import TokenType from "./TokenType";

export class Interpreter implements Visitor {
  private environment = new Environment();

  interpret(expression: Expr) {
    try {
      const value = this.evaluate(expression);
      return this.stringify(value);
    } catch (error) {
      if (error instanceof RuntimeError) {
        Eevee.runtimeError(error as RuntimeError);
      }

      return null;
    }
  }

  interpretStmt(statements: Array<Stmt>) {
    try {
      statements.forEach((statement) => {
        this.execute(statement);
      });
    } catch (error) {
      if (error instanceof RuntimeError) Eevee.runtimeError(error);
      return null;
    }
  }

  private evaluate(expr: Expr) {
    return expr.accept(this);
  }

  private execute(stmt: Stmt) {
    return stmt.accept(this);
  }

  private executeBlock(
    statements: Array<Stmt | null>,
    environment: Environment
  ) {
    const previous = this.environment;

    try {
      this.environment = environment;

      statements.forEach((statement) => {
        if (statement) this.execute(statement);
      });
    } finally {
      this.environment = previous;
    }
  }

  public visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  public visitIfStmt(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.executeBlock(stmt.consequent, new Environment(this.environment));
    } else if (stmt.alternate) {
      this.executeBlock(stmt.alternate, new Environment(this.environment));
    }

    return null;
  }

  public visitWhileStmt(stmt: While) {
    while (this.evaluate(stmt.condition)) {
      this.execute(stmt.body);
    }
    return null;
  }

  public visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    Eevee.log(this.stringify(value));
  }

  public visitVarStmt(stmt: Var) {
    let value = null;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitAssignStmt(expr: Assign) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  public visitLiteralBooleanExpr(expr: LiteralBoolean): boolean {
    return expr.value;
  }
  public visitLiteralNumberExpr(expr: LiteralNumber): number {
    return expr.value;
  }
  public visitLiteralStringExpr(expr: LiteralString): string {
    return expr.value;
  }
  public visitLiteralNullExpr(expr: LiteralNull): null {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }

    return this.evaluate(expr.right);
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  public visitVariableExpr(expr: Variable) {
    return this.environment.get(expr.name);
  }

  public visitAssignExpr(expr: Assign) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  public visitConditionalExpr(expr: Conditional) {
    const condition = this.evaluate(expr.condition);
    const consequent = this.evaluate(expr.consequent);
    const alternate = this.evaluate(expr.alternate);

    if (this.isTruthy(condition)) {
      return consequent;
    } else {
      return alternate;
    }
  }

  public visitUnaryExpr(expr: Unary) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
      case TokenType.BANG:
        return !this.isTruthy(right);
      default:
        break;
    }

    // Unreachable.
    return null;
  }

  public visitPostfixExpr(expr: Postfix) {
    const left = this.evaluate(expr.left);
    let variable = null;

    if (expr.left instanceof Variable) {
      variable = expr.left as Variable;
    }

    switch (expr.operator.type) {
      case TokenType.MINUS_MINUS:
        this.checkNumberOperand(expr.operator, left);
        if (variable !== null) this.environment.assign(variable.name, left - 1);
        return left - 1;
      case TokenType.PLUS_PLUS:
        this.checkNumberOperand(expr.operator, left);
        if (variable !== null) this.environment.assign(variable.name, left + 1);
        return left + 1;
      default:
        break;
    }

    // Unreachable.
    return null;
  }

  public visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }

        if (typeof left === "string" && typeof right === "string") {
          return left.concat(right);
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be numbers or strings."
        );
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        this.checkDivisionByZero(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenType.PERCENT:
        this.checkNumberOperands(expr.operator, left, right);
        return left % right;
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      default:
        break;
    }

    // Unreachable.
    return null;
  }

  private checkNumberOperand(operator: Token, operand: number) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: number, right: number) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private checkDivisionByZero(operator: Token, left: number, right: number) {
    this.checkNumberOperands(operator, left, right);
    if (left === 0 || right === 0) {
      throw new RuntimeError(operator, "Division by zero is not possible.");
    }

    return;
  }

  private isTruthy(object: any): boolean {
    if (object === null || object === undefined) return false;
    if (typeof object === "boolean") return object;
    return true;
  }

  private isEqual(a: any, b: any): boolean {
    if (a === null && b === null) {
      return true;
    }

    if (a === null) return false;

    return a === b;
  }

  private stringify(object: any): string {
    if (object === null) return "nil";

    if (object instanceof Number) {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.replace(".0", "");
      }
      return text;
    }

    return object.toString();
  }
}
