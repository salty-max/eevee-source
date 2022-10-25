import Token from "./Token";

class RuntimeError extends Error {
  readonly token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}

export default RuntimeError;
