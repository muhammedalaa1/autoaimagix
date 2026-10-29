import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../../db/index.js";
import { notes, users } from "../../db/schema.js";

const { passwordHash: _passwordHash, ...publicUserColumns } = getTableColumns(users);

export async function listUsers() {
  return db
    .select({ ...publicUserColumns, notesCount: count(notes.id) })
    .from(users)
    .leftJoin(notes, eq(notes.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}
