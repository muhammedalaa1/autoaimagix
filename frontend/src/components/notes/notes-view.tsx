"use client";

import { ChevronLeft, ChevronRight, Plus, StickyNote } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/use-notes";
import { getErrorMessage } from "@/lib/api/client";
import type { Note } from "@/lib/api/types";
import { useUser } from "@/lib/auth/user-context";
import { DeleteNoteDialog } from "./delete-note-dialog";
import { NoteCard } from "./note-card";
import { NoteFormDialog } from "./note-form-dialog";

type DialogState = { type: "create" } | { type: "edit"; note: Note } | { type: "delete"; note: Note } | null;

export function NotesView() {
  const user = useUser();
  const isAdmin = user.role === "admin";
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>(null);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useNotes(page);

  const close = () => setDialog(null);
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title={isAdmin ? "All notes" : "My notes"}
        description={
          isAdmin
            ? "As an admin you can see every user's notes. You can only edit or delete your own."
            : "Only you can see, edit, and delete your notes."
        }
        action={
          <Button onClick={() => setDialog({ type: "create" })}>
            <Plus />
            New note
          </Button>
        }
      />

      {isPending ? (
        <NotesGridSkeleton />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState onCreate={() => setDialog({ type: "create" })} />
      ) : (
        <div
          className="grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 data-[stale=true]:opacity-60"
          data-stale={isPlaceholderData}
        >
          {data.data.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwner={note.userId === user.id}
              showAuthor={isAdmin}
              onEdit={() => setDialog({ type: "edit", note })}
              onDelete={() => setDialog({ type: "delete", note })}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} notes
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPlaceholderData}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isPlaceholderData}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <NoteFormDialog
        open={dialog?.type === "create" || dialog?.type === "edit"}
        note={dialog?.type === "edit" ? dialog.note : undefined}
        onOpenChange={(open) => !open && close()}
      />
      <DeleteNoteDialog
        note={dialog?.type === "delete" ? dialog.note : undefined}
        onOpenChange={(open) => !open && close()}
        onDeleted={() => {
          // Step back if we just removed the last note on this page.
          if (data?.data.length === 1 && page > 1) setPage((p) => p - 1);
        }}
      />
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <StickyNote className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">No notes yet</p>
        <p className="text-sm text-muted-foreground">Create your first note to get started.</p>
      </div>
      <Button onClick={onCreate}>
        <Plus />
        New note
      </Button>
    </div>
  );
}

function NotesGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
