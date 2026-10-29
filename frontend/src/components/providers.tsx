"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

/** Session expired or revoked mid-use: send the user back to log in, keeping their place. */
function handleUnauthorized(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401) return;
  const { pathname, search } = window.location;
  if (pathname === "/login" || pathname === "/register") return;
  // Hard reload on purpose: discards every cached query belonging to the expired session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
  window.location.assign(`/login?next=${encodeURIComponent(pathname + search)}`);
}

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't retry client errors (validation, auth, not found) — only transient failures.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
