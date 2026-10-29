import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import * as usersController from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(authenticate, authorize("admin"));

usersRouter.get("/", usersController.list);
