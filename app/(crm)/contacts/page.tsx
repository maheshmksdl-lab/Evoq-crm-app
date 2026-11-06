import type { Metadata } from "next";
import { ContactsList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Contacts" };
export default function Page() {
  return <ContactsList />;
}
