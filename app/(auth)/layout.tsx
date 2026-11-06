import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <span className="rounded-xl bg-white px-4 py-2 shadow-card"><Image src="/logo.png" alt="EVOQ CRM" width={160} height={40} priority className="h-10 w-auto" /></span>
        </div>
        <div className="rounded-2xl border border-line bg-card/95 p-6 shadow-pop sm:p-8">{children}</div>
        <p className="mt-6 text-center text-caption text-ink-muted">EVOQ CRM · Make the record understandable, the relationship visible and the next action clear.</p>
      </div>
    </main>
  );
}
