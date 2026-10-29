import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { loginLimiter, registerLimiter } from "../../middlewares/rate-limit";
import * as authController from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", registerLimiter, authController.register);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
