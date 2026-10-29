import { z } from "zod";

const title = z.string().trim().min(1, "Title is required").max(200, "Title must be at most 200 characters");
const content = z.string().max(10_000, "Content must be at most 10,000 characters");

export const createNoteSchema = z
  .object({
    title,
    content: content.default(""),
  })
  .strict();

export const updateNoteSchema = z
  .object({ title, content })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update (title or content)",
  });

export const noteIdParamsSchema = z.object({
  id: z.uuid("Note id must be a valid UUID"),
});

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
