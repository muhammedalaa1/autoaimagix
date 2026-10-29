import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import * as usersController from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate, authorize("admin"));

usersRouter.get("/", usersController.list);
