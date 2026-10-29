import { api } from "./client";
import type { AdminUser, Note, Pagination, User, Weather } from "./types";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";
import type { NoteInput } from "@/lib/validations/notes";

interface Data<T> {
  data: T;
}

export const authApi = {
  login: (input: LoginInput) => api<Data<User>>("/auth/login", { method: "POST", body: input }),
  register: (input: RegisterInput) => api<Data<User>>("/auth/register", { method: "POST", body: input }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
};

export const notesApi = {
  list: (params: { page: number; limit: number }) =>
    api<Data<Note[]> & { pagination: Pagination }>("/notes", { query: params }),
  create: (input: NoteInput) => api<Data<Note>>("/notes", { method: "POST", body: input }),
  update: (id: string, input: Partial<NoteInput>) =>
    api<Data<Note>>(`/notes/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
  remove: (id: string) => api<void>(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const weatherApi = {
  current: (params: { city: string; units: "metric" | "imperial" }, signal?: AbortSignal) =>
    api<Data<Weather>>("/weather", { query: params, signal }),
};

export const usersApi = {
  list: () => api<Data<AdminUser[]>>("/users"),
};
