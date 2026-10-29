"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteNote } from "@/hooks/use-notes";
import { getErrorMessage } from "@/lib/api/client";
import type { Note } from "@/lib/api/types";

interface DeleteNoteDialogProps {
  note?: Note;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteNoteDialog({ note, onOpenChange, onDeleted }: DeleteNoteDialogProps) {
  const deleteNote = useDeleteNote();

  const confirm = () => {
    if (!note) return;
    deleteNote.mutate(note.id, {
      onSuccess: () => {
        toast.success("Note deleted");
        onDeleted();
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <AlertDialog open={Boolean(note)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{note?.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteNote.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleteNote.isPending} onClick={confirm}>
            {deleteNote.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
