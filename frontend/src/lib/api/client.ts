import type { ApiErrorBody, ApiErrorDetail } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Field-level validation messages keyed by field name, for form display. */
  get fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const { field, message } of this.details) {
      if (field && !(field in result)) result[field] = message;
    }
    return result;
  }
}

type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

/**
 * Browser-side fetch wrapper for the API. Requests go to same-origin /api/*
 * (proxied to Express by next.config.ts), so the httpOnly auth cookie is sent
 * automatically and is never touched by JavaScript.
 */
export async function api<T>(path: string, { method = "GET", body, query, signal }: RequestOptions = {}) {
  const url = new URL(`/api${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? `Request failed with status ${response.status}`,
      error?.details,
    );
  }

  return payload as T;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
