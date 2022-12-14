import Token from "./Token";

export interface Visitor {
  visitAssignExpr(expr: Assign): any;
  visitBinaryExpr(expr: Binary): any;
  visitConditionalExpr(expr: Conditional): any;
  visitGroupingExpr(expr: Grouping): any;
  visitLiteralNumberExpr(expr: LiteralNumber): any;
  visitLiteralStringExpr(expr: LiteralString): any;
  visitLiteralNullExpr(expr: LiteralNull): any;
  visitLiteralBooleanExpr(expr: LiteralBoolean): any;
  visitLogicalExpr(expr: Logical): any;
  visitPostfixExpr(expr: Postfix): any;
  visitUnaryExpr(expr: Unary): any;
  visitVariableExpr(expr: Variable): any;
}

export abstract class Expr {
  abstract accept(visitor: Visitor): any
}

export class Assign extends Expr {
  name: Token;
  value: Expr;

  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitAssignExpr(this);
  }
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

  override accept(visitor: Visitor): any {
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

  override accept(visitor: Visitor): any {
    return visitor.visitConditionalExpr(this);
  }
}

export class Grouping extends Expr {
  expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitGroupingExpr(this);
  }
}

export class LiteralNumber extends Expr {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitLiteralNumberExpr(this);
  }
}

export class LiteralString extends Expr {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitLiteralStringExpr(this);
  }
}

export class LiteralNull extends Expr {
  value: null;

  constructor(value: null) {
    super();
    this.value = value;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitLiteralNullExpr(this);
  }
}

export class LiteralBoolean extends Expr {
  value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitLiteralBooleanExpr(this);
  }
}

export class Logical extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitLogicalExpr(this);
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

  override accept(visitor: Visitor): any {
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

  override accept(visitor: Visitor): any {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expr {
  name: Token;

  constructor(name: Token) {
    super();
    this.name = name;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitVariableExpr(this);
  }
}

