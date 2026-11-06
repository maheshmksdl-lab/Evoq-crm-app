import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="text-kpi text-heading">404</p>
        <h1 className="mt-1 text-section text-heading">That page doesn&apos;t exist</h1>
        <p className="mt-1 text-body text-ink-muted">It may have moved, or the link is wrong.</p>
        <Link href="/" className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground hover:bg-primary-hover">Back to dashboard</Link>
      </div>
    </main>
  );
}
