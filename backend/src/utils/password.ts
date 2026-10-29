import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// Used when the email does not exist, so a failed login costs the same time
// whether or not the account exists (prevents user enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync("timing-attack-dummy-password", SALT_ROUNDS);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string | undefined): Promise<boolean> {
  return bcrypt.compare(plain, hash ?? DUMMY_HASH).then((match) => match && hash !== undefined);
}
