import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { AppError } from "../utils/app-error";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err: unknown, _req: Request, res: Response<ErrorBody>, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.issues.map((issue) => ({
          field: issue.path.join(".") || null,
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  // Malformed JSON body or oversized payload from express.json()
  if (isHttpError(err) && err.status < 500) {
    const tooLarge = err.type === "entity.too.large";
    res.status(err.status).json({
      error: {
        code: tooLarge ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
        message: tooLarge ? "Request body is too large" : "Malformed JSON body",
      },
    });
    return;
  }

  // Postgres unique violation that slipped past an application check (race condition)
  if (isPgError(err) && err.code === "23505") {
    res.status(409).json({ error: { code: "CONFLICT", message: "Resource already exists" } });
    return;
  }

  // Log the full error server-side only; DB errors can contain SQL and user data.
  console.error(isProduction && err instanceof Error ? err.message : err);
  res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  });
}

function isHttpError(err: unknown): err is { status: number; type?: string } {
  return typeof err === "object" && err !== null && "status" in err && typeof err.status === "number";
}

function isPgError(err: unknown): err is { code: string } {
  const candidate = err instanceof Error && "cause" in err ? err.cause : err;
  return (
    typeof candidate === "object" && candidate !== null && "code" in candidate && typeof candidate.code === "string"
  );
}
