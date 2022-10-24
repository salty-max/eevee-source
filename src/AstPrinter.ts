import {
  Visitor,
  Expr,
  Binary,
  Grouping,
  Literal,
  Unary,
  Postfix,
} from "./Expr";

class AstPrinter implements Visitor<String> {
  print(expr: Expr): String {
    return expr.accept(this);
  }

  public visitBinaryExpr<String>(expr: Binary): String {
    return this.parenthesize(
      expr.operator.lexeme,
      expr.left,
      expr.right
    ) as String;
  }

  public visitGroupingExpr<String>(expr: Grouping): String {
    return this.parenthesize("group", expr.expression) as String;
  }

  public visitLiteralExpr<String>(expr: Literal): String {
    if (expr.value === null) return "nil" as String;
    return expr.value.toString() as String;
  }

  public visitUnaryExpr<String>(expr: Unary): String {
    return this.parenthesize(expr.operator.lexeme, expr.right) as String;
  }

  public visitPostfixExpr<String>(expr: Postfix): String {
    return this.parenthesize(expr.operator.lexeme, expr.left) as String;
  }

  private parenthesize(name: string, ...exprs: Array<Expr>): String {
    let builder = `(${name}`;

    exprs.forEach((expr) => {
      builder += ` ${expr.accept(this)}`;
    });

    builder += ")";

    return builder;
  }
}

export default AstPrinter;
