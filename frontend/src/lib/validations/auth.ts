import { z } from "zod";

// Mirrors backend/src/modules/auth/auth.schema.ts for instant client feedback.
// The server re-validates everything; these rules are only a UX convenience.

const email = z.email("Enter a valid email address").max(255);

export const passwordRules = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "At most 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email,
  password: passwordRules,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
