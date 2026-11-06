import type { Db, PermAction, User } from "@/lib/schemas";
import type { PERM_MODULES } from "@/lib/schemas/options";

export type PermModule = (typeof PERM_MODULES)[number];
export type Tier = "admin" | "manager" | "rep";

/** Experience tier derived from the existing role names (drives which dashboard/journey a user sees). */
export function tierOf(role: User["role"]): Tier {
  if (role === "Super Admin" || role === "Administrator") return "admin";
  if (role === "VP of Operations" || role === "Operations Manager" || role === "Team Leader") return "manager";
  return "rep";
}

/** Settings ▸ Permissions matrix. Super Admin always has every permission (cannot lock themselves out). */
export function can(db: Db, user: User | null, mod: PermModule, action: PermAction): boolean {
  if (!user || !user.active) return false;
  if (user.role === "Super Admin") return true;
  const cell = db.settings.permissions[mod]?.[user.role];
  if (!cell) return false;
  return Boolean(cell.fullAccess || cell[action]);
}

export const MODULE_PERM: Record<string, PermModule> = {
  leads: "Leads", deals: "Deals", contacts: "Contacts", accounts: "Accounts", tasks: "Tasks", calls: "Calls", meetings: "Meetings",
};

/**
 * Team scope for manager visibility: the user plus every user whose role sits below
 * the user's role in Settings ▸ Roles (reportsTo chain). Admin tier sees everyone.
 */
export function teamUserIds(db: Db, user: User): string[] {
  if (tierOf(user.role) === "admin") return db.users.map((u) => u.id);
  const myRole = db.roles.find((r) => r.name === user.role);
  if (!myRole) return [user.id];
  const below = new Set<string>();
  const walk = (parentId: string) => {
    db.roles.filter((r) => r.reportsTo === parentId).forEach((r) => {
      below.add(r.name);
      walk(r.id);
    });
  };
  walk(myRole.id);
  return db.users.filter((u) => u.id === user.id || below.has(u.role)).map((u) => u.id);
}

export class PermissionError extends Error {
  constructor(public readonly mod: string, public readonly action: string) {
    super(`You don't have permission to ${action === "read" ? "view" : action} ${mod.toLowerCase()}. Ask an administrator to update your role's permissions.`);
    this.name = "PermissionError";
  }
}
