import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import * as weatherController from "./weather.controller.js";

export const weatherRouter = Router();

weatherRouter.get("/", authenticate, weatherController.getCurrent);
