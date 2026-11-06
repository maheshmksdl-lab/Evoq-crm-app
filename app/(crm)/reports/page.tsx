import type { Metadata } from "next";
import { ReportsLibrary } from "@/components/modules/reports";

export const metadata: Metadata = { title: "Reports" };
export default function Page() {
  return <ReportsLibrary />;
}
