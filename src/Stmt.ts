import { Expr } from "./Expr";
import Token from "./Token";

export interface Visitor {
  visitExpressionStmt(stmt: Expression): any;
  visitIfStmt(stmt: If): any;
  visitPrintStmt(stmt: Print): any;
  visitVarStmt(stmt: Var): any;
  visitBlockStmt(stmt: Block): any;
  visitWhileStmt(stmt: While): any;
  visitBreakStmt(stmt: Break): any;
}

export abstract class Stmt {
  abstract accept(visitor: Visitor): any;
}

export class Expression extends Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitExpressionStmt(this);
  }
}

export class If extends Stmt {
  condition: Expr;
  consequent: Array<Stmt | null>;
  alternate: Array<Stmt | null>;

  constructor(
    condition: Expr,
    consequent: Array<Stmt | null>,
    alternate: Array<Stmt | null>
  ) {
    super();
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitIfStmt(this);
  }
}

export class Print extends Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitPrintStmt(this);
  }
}

export class Var extends Stmt {
  name: Token;
  initializer: Expr | null;

  constructor(name: Token, initializer: Expr | null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitVarStmt(this);
  }
}

export class Block extends Stmt {
  statements: Array<Stmt | null>;

  constructor(statements: Array<Stmt | null>) {
    super();
    this.statements = statements;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitBlockStmt(this);
  }
}

export class While extends Stmt {
  condition: Expr;
  body: Stmt;

  constructor(condition: Expr, body: Stmt) {
    super();
    this.condition = condition;
    this.body = body;
  }

  override accept(visitor: Visitor): any {
    return visitor.visitWhileStmt(this);
  }
}

export class Break extends Stmt {
  constructor() {
    super();
  }

  override accept(visitor: Visitor): any {
    return visitor.visitBreakStmt(this);
  }
}
