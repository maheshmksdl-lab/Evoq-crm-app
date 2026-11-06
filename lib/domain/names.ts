import type { Account, Contact, Deal, Lead, RecordModule, User } from "@/lib/schemas";

export function personName(p: { salutation?: string; firstName?: string; lastName: string }) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "Unnamed";
}
export function initials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const MODULE_LABEL: Record<RecordModule, { singular: string; plural: string; path: string }> = {
  leads: { singular: "Lead", plural: "Leads", path: "/leads" },
  contacts: { singular: "Contact", plural: "Contacts", path: "/contacts" },
  accounts: { singular: "Account", plural: "Accounts", path: "/accounts" },
  deals: { singular: "Deal", plural: "Deals", path: "/deals" },
};

export type AnyRecord = Lead | Contact | Account | Deal;
export function recordTitle(module: RecordModule, r: AnyRecord): string {
  if (module === "leads" || module === "contacts") return personName(r as Lead);
  return (r as Account | Deal).name;
}
export function recordHref(module: string, id: string) {
  return `/${module}/${id}`;
}
export function userName(users: User[], id: string | null | undefined) {
  if (!id) return "Unassigned";
  return users.find((u) => u.id === id)?.name ?? "Unknown user";
}
