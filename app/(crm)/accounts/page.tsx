import type { Metadata } from "next";
import { AccountsList } from "@/components/modules/crm-lists";

export const metadata: Metadata = { title: "Accounts" };
export default function Page() {
  return <AccountsList />;
}
