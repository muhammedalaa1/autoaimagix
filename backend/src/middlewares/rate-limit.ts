import { rateLimit } from "express-rate-limit";

const rateLimitResponse = (message: string) => ({
  error: { code: "TOO_MANY_REQUESTS", message },
});

/** Brute-force protection for login: 5 failed attempts per IP per 15 minutes. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true, // only failed logins count toward the limit
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse("Too many login attempts. Please try again in 15 minutes."),
});

/** Slows down mass account creation. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse("Too many accounts created from this IP. Please try again later."),
});

/** Generous global limit to protect the API (and the paid upstream weather key). */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse("Too many requests. Please slow down."),
});
