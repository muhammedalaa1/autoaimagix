import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProduction } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { apiLimiter } from "./middlewares/rate-limit";
import { verifyOrigin } from "./middlewares/verify-origin";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true, // allow the browser to send the auth cookie
    }),
  );
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/api", apiLimiter, verifyOrigin, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
