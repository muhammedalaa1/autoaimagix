import type { NextFunction, Request, Response } from "express";
import type { Role } from "../db/schema.js";
import { AppError } from "../utils/app-error.js";

/** Must run after `authenticate`. Allows the request only for the given roles. */
export function authorize(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw AppError.unauthorized();
    if (!allowed.includes(req.user.role)) throw AppError.forbidden();
    next();
  };
}
