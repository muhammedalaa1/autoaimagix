import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { notesRouter } from "./modules/notes/notes.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { weatherRouter } from "./modules/weather/weather.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/notes", notesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/weather", weatherRouter);
