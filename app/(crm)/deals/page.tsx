import type { Metadata } from "next";
import { DealsList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Deals" };
export default function Page() {
  return <DealsList />;
}
