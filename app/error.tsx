"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div role="alert" className="max-w-md text-center">
        <h1 className="text-section text-heading">Something went wrong</h1>
        <p className="mt-1 text-body text-ink-muted">{error.message || "An unexpected error occurred."}</p>
        <button type="button" onClick={reset} className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground hover:bg-primary-hover">Try again</button>
      </div>
    </main>
  );
}
