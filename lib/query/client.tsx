"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AuthError, PermissionError, subscribe } from "@/lib/services";

/** Errors that retrying cannot fix. */
function isTerminal(e: unknown) {
  return e instanceof PermissionError || e instanceof AuthError || (e instanceof Error && ["NotFoundError", "ValidationError", "StorageError"].includes(e.name));
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: (count, e) => !isTerminal(e) && count < 2,
          },
          mutations: {
            retry: false,
            onError: (e) => {
              // Forms show field errors themselves; this is the safety net so no failure is silent.
              if (e instanceof Error && e.name === "ValidationError") return;
              toast.error(e instanceof Error ? e.message : "Something went wrong. Try again.");
            },
          },
        },
      }),
  );

  // Any committed write (this tab or another) refreshes every active query.
  useEffect(() => {
    const off = subscribe(() => { client.invalidateQueries({ queryKey: ["crm"] }); });
    return () => { off(); };
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
