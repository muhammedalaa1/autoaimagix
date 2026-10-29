import { z } from "zod";

// Mirrors backend/src/modules/notes/notes.schema.ts.
export const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "At most 200 characters"),
  content: z.string().max(10_000, "At most 10,000 characters"),
});

export type NoteInput = z.infer<typeof noteSchema>;
