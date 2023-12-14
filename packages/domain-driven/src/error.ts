export class DomainError extends Error {
  constructor(message: string) {
    super(`[Domain Error]: ${message}`);
  }
}

export class ApplicativeError extends Error {
  constructor(message: string) {
    super(`[Applicative Error]: ${message}`);
  }
}

export class InfrastructureError extends Error {
  constructor(message: string) {
    super(`[Infrastructure Error]: ${message}`);
  }
}
