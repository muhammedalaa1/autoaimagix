"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { FormRootError } from "@/components/forms/form-root-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes";
import type { Note } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms";
import { noteSchema, type NoteInput } from "@/lib/validations/notes";

interface NoteFormDialogProps {
  open: boolean;
  /** Present when editing; absent when creating. */
  note?: Note;
  onOpenChange: (open: boolean) => void;
}

export function NoteFormDialog({ open, note, onOpenChange }: NoteFormDialogProps) {
  const isEdit = Boolean(note);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const isPending = createNote.isPending || updateNote.isPending;

  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", content: "" },
  });

  // Load the note being edited (or blank values) each time the dialog opens.
  useEffect(() => {
    if (open) form.reset({ title: note?.title ?? "", content: note?.content ?? "" });
  }, [open, note, form]);

  const onSubmit = form.handleSubmit((values) => {
    const options = {
      onSuccess: () => {
        toast.success(isEdit ? "Note updated" : "Note created");
        onOpenChange(false);
      },
      onError: (error: unknown) => applyServerErrors(error, form.setError, ["title", "content"]),
    };
    if (note) updateNote.mutate({ id: note.id, input: values }, options);
    else createNote.mutate(values, options);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit note" : "New note"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the title or content of your note." : "Write something worth remembering."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FormRootError message={form.formState.errors.root?.message} />
            <FormField
              control={form.control}
              name="title"
              label="Title"
              inputProps={{ placeholder: "Meeting notes", maxLength: 200, autoFocus: true }}
            />
            <FormField
              control={form.control}
              name="content"
              label="Content"
              multiline
              inputProps={{ placeholder: "Start typing…", rows: 8, maxLength: 10_000 }}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save changes" : "Create note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
