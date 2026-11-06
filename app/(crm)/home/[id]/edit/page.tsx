import type { Metadata } from "next";
import { DashboardBuilder } from "@/components/modules/dashboard-builder";

export const metadata: Metadata = { title: "Customize dashboard" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DashboardBuilder id={id} />;
}
