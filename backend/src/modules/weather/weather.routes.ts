import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import * as weatherController from "./weather.controller";

export const weatherRouter = Router();

weatherRouter.get("/", authenticate, weatherController.getCurrent);
