import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PageSkeleton } from "@/components/shared/states";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {/* list state lives in the URL (useSearchParams), which requires a Suspense boundary */}
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}
