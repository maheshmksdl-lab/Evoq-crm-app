import { Buildings, Users, Handshake, Star, CheckSquare } from "@phosphor-icons/react";
import { ModuleType } from "@/lib/moduleRelationships";

export const MODULE_ICON: Record<ModuleType, React.ElementType> = {
  Accounts: Buildings,
  Contacts: Users,
  Deals: Handshake,
  Leads: Star,
  Tasks: CheckSquare,
};

export const MODULE_COLOR: Record<ModuleType, string> = {
  Accounts: "#14B8A6",
  Contacts: "#3B82F6",
  Deals: "#8B5CF6",
  Leads: "#F59E0B",
  Tasks: "#EC4899",
};
