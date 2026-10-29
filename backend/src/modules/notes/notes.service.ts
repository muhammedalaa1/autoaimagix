import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { notes } from "../../db/schema.js";
import type { AuthUser } from "../../types/express.js";
import { AppError } from "../../utils/app-error.js";
import type { CreateNoteInput, ListNotesQuery, UpdateNoteInput } from "./notes.schema.js";

/*
 * Authorization rules
 * - user:  read / update / delete only their own notes.
 * - admin: read every note; update / delete only their own (the spec grants
 *          admins visibility, not ownership of other people's data).
 *
 * Ownership is enforced inside the SQL WHERE clause rather than by fetching
 * then checking, so there is no window for a time-of-check/time-of-use bug.
 * Someone else's note returns 404 (not 403) so ids can't be probed.
 */

const authorColumns = { id: true, name: true, email: true } as const;

function readScope(actor: AuthUser): SQL | undefined {
  return actor.role === "admin" ? undefined : eq(notes.userId, actor.id);
}

function ownedBy(actor: AuthUser, noteId: string): SQL {
  return and(eq(notes.id, noteId), eq(notes.userId, actor.id))!;
}

export async function listNotes(actor: AuthUser, { page, limit }: ListNotesQuery) {
  const where = readScope(actor);

  const [items, total] = await Promise.all([
    db.query.notes.findMany({
      where,
      orderBy: [desc(notes.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: { author: { columns: authorColumns } },
    }),
    db.$count(notes, where),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getNote(actor: AuthUser, noteId: string) {
  const scope = readScope(actor);
  const note = await db.query.notes.findFirst({
    where: scope ? and(eq(notes.id, noteId), scope) : eq(notes.id, noteId),
    with: { author: { columns: authorColumns } },
  });
  if (!note) throw AppError.notFound("Note not found");
  return note;
}

export async function createNote(actor: AuthUser, input: CreateNoteInput) {
  const [note] = await db
    .insert(notes)
    .values({ ...input, userId: actor.id }) // owner always comes from the session, never the body
    .returning();
  return note!;
}

export async function updateNote(actor: AuthUser, noteId: string, input: UpdateNoteInput) {
  const [note] = await db.update(notes).set(input).where(ownedBy(actor, noteId)).returning();
  if (!note) throw AppError.notFound("Note not found");
  return note;
}

export async function deleteNote(actor: AuthUser, noteId: string) {
  const [deleted] = await db.delete(notes).where(ownedBy(actor, noteId)).returning({ id: notes.id });
  if (!deleted) throw AppError.notFound("Note not found");
}
