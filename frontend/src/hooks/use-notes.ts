"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api/endpoints";
import type { NoteInput } from "@/lib/validations/notes";

export const NOTES_PAGE_SIZE = 12;

export const notesKeys = {
  all: ["notes"] as const,
  list: (page: number) => [...notesKeys.all, "list", page] as const,
};

export function useNotes(page: number) {
  return useQuery({
    queryKey: notesKeys.list(page),
    queryFn: () => notesApi.list({ page, limit: NOTES_PAGE_SIZE }),
    placeholderData: keepPreviousData, // keep the current page visible while the next one loads
  });
}

function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notesKeys.all });
}

export function useCreateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: (input: NoteInput) => notesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NoteInput> }) => notesApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onSuccess: invalidate,
  });
}
