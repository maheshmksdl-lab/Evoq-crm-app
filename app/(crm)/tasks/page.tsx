import type { Metadata } from "next";
import { TasksList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Tasks" };
export default function Page() {
  return <TasksList />;
}
