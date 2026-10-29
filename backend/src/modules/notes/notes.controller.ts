import type { Request, Response } from "express";
import { getAuthUser } from "../../middlewares/authenticate.js";
import {
  createNoteSchema,
  listNotesQuerySchema,
  noteIdParamsSchema,
  updateNoteSchema,
} from "./notes.schema.js";
import * as notesService from "./notes.service.js";

export async function list(req: Request, res: Response) {
  const query = listNotesQuerySchema.parse(req.query);
  const { items, pagination } = await notesService.listNotes(getAuthUser(req), query);
  res.status(200).json({ data: items, pagination });
}

export async function getById(req: Request, res: Response) {
  const { id } = noteIdParamsSchema.parse(req.params);
  const note = await notesService.getNote(getAuthUser(req), id);
  res.status(200).json({ data: note });
}

export async function create(req: Request, res: Response) {
  const input = createNoteSchema.parse(req.body);
  const note = await notesService.createNote(getAuthUser(req), input);
  res.status(201).json({ data: note });
}

export async function update(req: Request, res: Response) {
  const { id } = noteIdParamsSchema.parse(req.params);
  const input = updateNoteSchema.parse(req.body);
  const note = await notesService.updateNote(getAuthUser(req), id, input);
  res.status(200).json({ data: note });
}

export async function remove(req: Request, res: Response) {
  const { id } = noteIdParamsSchema.parse(req.params);
  await notesService.deleteNote(getAuthUser(req), id);
  res.status(204).end();
}
