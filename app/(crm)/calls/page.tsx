import type { Metadata } from "next";
import { CallsList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Calls" };
export default function Page() {
  return <CallsList />;
}
