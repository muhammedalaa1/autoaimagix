import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { loginLimiter, registerLimiter } from "../../middlewares/rate-limit.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerLimiter, authController.register);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
