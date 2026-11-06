import type { Metadata } from "next";
import { MeetingsList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Meetings" };
export default function Page() {
  return <MeetingsList />;
}
