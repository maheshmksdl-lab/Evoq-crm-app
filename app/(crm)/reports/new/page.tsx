import type { Metadata } from "next";
import { ReportBuilder } from "@/components/modules/reports";

export const metadata: Metadata = { title: "New report" };
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const n = template === undefined ? undefined : Number(template);
  return <ReportBuilder template={n !== undefined && Number.isInteger(n) ? n : undefined} />;
}
