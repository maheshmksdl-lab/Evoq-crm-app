import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Request access" };
export default function Page() {
  return <RegisterForm />;
}
