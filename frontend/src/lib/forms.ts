import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/client";

/**
 * Maps an API error onto the form: field-level validation errors go under
 * their inputs, anything else becomes a form-level `root` error.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly Path<T>[],
) {
  if (error instanceof ApiError) {
    const fieldErrors = error.fieldErrors;
    let mapped = false;
    for (const field of knownFields) {
      const message = fieldErrors[field];
      if (message) {
        setError(field, { type: "server", message });
        mapped = true;
      }
    }
    if (!mapped) setError("root", { type: "server", message: error.message });
    return;
  }
  setError("root", { type: "server", message: "Something went wrong. Please try again." });
}
