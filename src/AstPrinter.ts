import {
  Visitor,
  Expr,
  Binary,
  Grouping,
  Unary,
  Postfix,
  Conditional,
  LiteralNumber,
  LiteralBoolean,
  LiteralNull,
  LiteralString,
} from "./Expr";

class AstPrinter implements Visitor {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitConditionalExpr(expr: Conditional): string {
    return this.parenthesize(
      "?:",
      expr.condition,
      expr.consequent,
      expr.alternate
    );
  }

  public visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  public visitLiteralNumberExpr(expr: LiteralNumber): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  public visitLiteralBooleanExpr(expr: LiteralBoolean): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  public visitLiteralNullExpr(_expr: LiteralNull): string {
    return "nil";
  }

  public visitLiteralStringExpr(expr: LiteralString): string {
    if (expr.value === null) return "nil";
    return expr.value;
  }

  public visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  public visitPostfixExpr(expr: Postfix): string {
    return this.parenthesize(expr.operator.lexeme, expr.left);
  }

  private parenthesize(name: string, ...exprs: Array<Expr>): string {
    let builder = `(${name}`;

    exprs.forEach((expr) => {
      builder += ` ${expr.accept(this)}`;
    });

    builder += ")";

    return builder;
  }
}

export default AstPrinter;
