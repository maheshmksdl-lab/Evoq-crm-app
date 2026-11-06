import type { Metadata } from "next";
import { LeadsList } from "@/components/modules/leads-list";

export const metadata: Metadata = { title: "Leads" };
export default function LeadsPage() {
  return <LeadsList />;
}
