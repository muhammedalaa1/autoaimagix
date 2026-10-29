import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import { AppError } from "../utils/app-error";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "../utils/auth-cookie";
import { verifyAccessToken } from "../utils/jwt";

/**
 * Reads the JWT from the httpOnly cookie and loads the user from the DB.
 *
 * The role is taken from the database, never from the token, so a demoted or
 * deleted user loses access immediately instead of when the token expires.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== "string" || token.length === 0) {
    throw AppError.unauthorized();
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    clearAuthCookie(res);
    throw AppError.unauthorized("Session is invalid or has expired");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
    columns: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    clearAuthCookie(res);
    throw AppError.unauthorized("Session is invalid or has expired");
  }

  req.user = user;
  next();
}

/** Typed accessor for handlers mounted behind `authenticate`. */
export function getAuthUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}
