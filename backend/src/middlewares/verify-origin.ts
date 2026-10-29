import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence for cookie auth. Browsers always send `Origin` on cross-site
 * state-changing requests, so rejecting unknown origins stops another site
 * from riding the user's cookie. Requests without `Origin` (curl, Postman,
 * server-to-server) carry no ambient browser cookies and are allowed.
 */
export function verifyOrigin(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  if (origin && !env.CORS_ORIGINS.includes(origin)) {
    throw AppError.forbidden("Request origin is not allowed");
  }
  next();
}
