"use client";

import { Pencil, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Note } from "@/lib/api/types";
import { formatDate, formatDateTime } from "@/lib/format";

interface NoteCardProps {
  note: Note;
  /** UI hint only: the API independently rejects edits/deletes by non-owners. */
  isOwner: boolean;
  showAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, isOwner, showAuthor, onEdit, onDelete }: NoteCardProps) {
  const edited = note.updatedAt !== note.createdAt;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2 break-words">{note.title}</CardTitle>
        <CardDescription title={formatDateTime(note.updatedAt)}>
          {edited ? `Edited ${formatDate(note.updatedAt)}` : formatDate(note.createdAt)}
        </CardDescription>
        {isOwner && (
          <CardAction className="flex gap-0.5">
            <Button variant="ghost" size="icon-xs" aria-label={`Edit "${note.title}"`} onClick={onEdit}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label={`Delete "${note.title}"`} onClick={onDelete}>
              <Trash2 />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {note.content ? (
          <p className="line-clamp-5 text-sm break-words whitespace-pre-wrap text-muted-foreground">{note.content}</p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">No content</p>
        )}
      </CardContent>
      {showAuthor && note.author && (
        <CardFooter className="gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5" />
          <span className="truncate">{isOwner ? "You" : `${note.author.name} · ${note.author.email}`}</span>
        </CardFooter>
      )}
    </Card>
  );
}
