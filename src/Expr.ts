import Token from "./Token";

export interface Visitor<R> {
  visitBinaryExpr<R>(expr: Binary): R;
  visitConditionalExpr<R>(expr: Conditional): R;
  visitGroupingExpr<R>(expr: Grouping): R;
  visitLiteralExpr<R>(expr: Literal): R;
  visitPostfixExpr<R>(expr: Postfix): R;
  visitUnaryExpr<R>(expr: Unary): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R
}

export class Binary extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Conditional extends Expr {
  condition: Expr;
  consequent: Expr;
  alternate: Expr;

  constructor(condition: Expr, consequent: Expr, alternate: Expr) {
    super();
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitConditionalExpr(this);
  }
}

export class Grouping extends Expr {
  expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  value: Object | null;

  constructor(value: Object | null) {
    super();
    this.value = value;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Postfix extends Expr {
  left: Expr;
  operator: Token;

  constructor(left: Expr, operator: Token) {
    super();
    this.left = left;
    this.operator = operator;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPostfixExpr(this);
  }
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

