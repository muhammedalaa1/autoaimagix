import type { CookieOptions, Response } from "express";
import { env, isProduction } from "../config/env.js";

export const AUTH_COOKIE_NAME = "access_token";

const baseOptions: CookieOptions = {
  httpOnly: true, // not readable from JS -> token can't be stolen via XSS
  secure: isProduction || env.COOKIE_SAME_SITE === "none", // browsers require Secure with SameSite=None
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseOptions,
    maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, baseOptions);
}
