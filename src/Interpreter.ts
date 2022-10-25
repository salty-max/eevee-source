import { Eevee } from ".";
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
  Visitor,
} from "./Expr";
import RuntimeError from "./RuntimeError";
import Token from "./Token";
import TokenType from "./TokenType";

export class Interpreter implements Visitor {
  interpret(expression: Expr): void {
    try {
      const value = this.evaluate(expression);
      Eevee.log(this.stringify(value));
    } catch (error) {
      if (error instanceof RuntimeError) {
        Eevee.runtimeError(error as RuntimeError);
      } else {
        console.error("Unexpected error.", error);
      }
    }
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

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
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

    switch (expr.operator.type) {
      case TokenType.MINUS_MINUS:
        this.checkNumberOperand(expr.operator, left);
        return left - 1;
      case TokenType.PLUS_PLUS:
        this.checkNumberOperand(expr.operator, left);
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

  private evaluate(expr: Expr) {
    return expr.accept(this);
  }

  private checkNumberOperand(operator: Token, operand: number): void {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: number,
    right: number
  ): void {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private checkDivisionByZero(
    operator: Token,
    left: number,
    right: number
  ): void {
    this.checkNumberOperands(operator, left, right);
    if (left === 0 || right === 0) {
      throw new RuntimeError(operator, "Division by zero is not possible.");
    }

    return;
  }

  private isTruthy(object: any): boolean {
    if (object === null) return false;
    if (object instanceof Boolean) return Boolean(object);
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
