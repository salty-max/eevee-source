import RuntimeError from "./RuntimeError";
import Token from "./Token";

export class Environment {
  readonly parent: Environment | undefined;
  private readonly values: Map<string, any> = new Map<string, any>();

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  define(name: string, value: any): void {
    this.values.set(name, value);
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}

export default Environment;
