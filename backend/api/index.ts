/**
 * Vercel serverless entry point. vercel.json rewrites every request here, and
 * Vercel invokes the default-exported Express app as the request handler.
 * Local development uses src/server.ts, which calls app.listen() instead.
 */
import { createApp } from "../src/app";

export default createApp();
