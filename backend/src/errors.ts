import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = new.target.name;
  }
}

export class SymbolNotFoundError extends AppError {
  constructor(symbol: string, reason: string) {
    super(`Symbol "${symbol}" not found: ${reason}`, 404);
  }
}

export class UpstreamError extends AppError {
  constructor(reason: string) {
    super(`Upstream request to Yahoo Finance failed: ${reason}`, 502);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express only recognizes a 4-arg function as error-handling middleware,
  // so `next` must stay in the signature even though it's unused.
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message } });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ error: { message: "Internal server error" } });
}
