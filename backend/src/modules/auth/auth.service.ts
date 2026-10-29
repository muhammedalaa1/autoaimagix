import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { users, type User } from "../../db/schema";
import { AppError } from "../../utils/app-error";
import { hashPassword, verifyPassword } from "../../utils/password";
import type { LoginInput, RegisterInput } from "./auth.schema";

/** Never expose the password hash outside the service layer. */
export function toPublicUser({ passwordHash: _passwordHash, ...user }: User) {
  return user;
}

export async function register(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  });
  if (existing) throw AppError.conflict("An account with this email already exists");

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "user", // hard-coded: admins are only created via the seed script
    })
    .returning();

  return toPublicUser(user!);
}

export async function login(input: LoginInput) {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });

  // Same message and same bcrypt cost for "no such email" and "wrong password".
  const valid = await verifyPassword(input.password, user?.passwordHash);
  if (!user || !valid) throw AppError.unauthorized("Invalid email or password");

  return toPublicUser(user);
}
