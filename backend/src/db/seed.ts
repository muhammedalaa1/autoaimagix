/**
 * Creates (or promotes) the admin account described by ADMIN_* env vars.
 * Public registration always creates role "user"; this script is the only
 * way to obtain an admin, so the role can never be self-assigned.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { users } from "./schema.js";
import { hashPassword } from "../utils/password.js";
import { passwordSchema } from "../modules/auth/auth.schema.js";

const seedEnv = z
  .object({
    ADMIN_EMAIL: z.email().transform((email) => email.toLowerCase()),
    ADMIN_PASSWORD: passwordSchema,
    ADMIN_NAME: z.string().trim().min(1).max(100).default("Admin"),
  })
  .parse(process.env);

async function main() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, seedEnv.ADMIN_EMAIL),
  });

  if (existing) {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
    console.log(`Promoted existing user ${seedEnv.ADMIN_EMAIL} to admin.`);
    return;
  }

  await db.insert(users).values({
    name: seedEnv.ADMIN_NAME,
    email: seedEnv.ADMIN_EMAIL,
    passwordHash: await hashPassword(seedEnv.ADMIN_PASSWORD),
    role: "admin",
  });
  console.log(`Created admin ${seedEnv.ADMIN_EMAIL}.`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
