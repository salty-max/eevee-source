import { Expr } from "./Expr";
import Token from "./Token";

export interface Visitor {
  visitExpressionStmt(stmt: Expression): any;
  visitPrintStmt(stmt: Print): any;
  visitVarStmt(stmt: Var): any;
  visitBlockStmt(stmt: Block): any;
}

export abstract class Stmt {
  abstract accept(visitor: Visitor): any
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
