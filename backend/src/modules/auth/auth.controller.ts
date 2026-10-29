import type { Request, Response } from "express";
import { getAuthUser } from "../../middlewares/authenticate";
import { clearAuthCookie, setAuthCookie } from "../../utils/auth-cookie";
import { signAccessToken } from "../../utils/jwt";
import { loginSchema, registerSchema } from "./auth.schema";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await authService.register(input);

  setAuthCookie(res, signAccessToken(user.id));
  res.status(201).json({ data: user });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await authService.login(input);

  setAuthCookie(res, signAccessToken(user.id));
  res.status(200).json({ data: user });
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(204).end();
}

export function me(req: Request, res: Response) {
  res.status(200).json({ data: getAuthUser(req) });
}
