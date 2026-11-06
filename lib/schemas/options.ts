/**
 * Controlled vocabularies. Every list here comes from the pre-migration
 * application (drawers, detail pages, Settings) unless marked NEW.
 * NEW values exist only where the handoff requires a module or field the
 * old app did not have (Calls, Meetings, lead priority); they are listed in
 * docs/ARCHITECTURE.md → "New vocabularies" for product sign-off.
 */
export const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."] as const;

export const LEAD_STATUSES = ["New", "Contacted", "In Progress", "Qualified", "Lost", "Unqualified"] as const;
/** Forward progression shown in the stage bar (pre-existing LeadDetail PIPELINE). */
export const LEAD_PIPELINE = ["New", "Contacted", "In Progress", "Qualified"] as const;
export const LEAD_CLOSED_STATUSES = ["Lost", "Unqualified"] as const;
export const LEAD_SOURCES = ["Web", "Referral", "Cold Call", "Advertisement", "Trade Show", "Word of Mouth", "Partner", "Other"] as const;
export const RATINGS = ["Hot", "Warm", "Cold"] as const;
/** Lead priority re-uses the app's existing High/Medium/Low priority set (from Tasks). */
export const PRIORITIES = ["High", "Medium", "Low"] as const;
export const EMPLOYEE_BANDS = ["1–10", "11–50", "51–200", "200+"] as const;

export const INDUSTRIES = [
  "Aerospace", "Agriculture", "Apparel", "Banking", "Biotechnology", "Chemicals", "Communications",
  "Construction", "Education", "Electronics", "Energy", "Engineering", "Entertainment", "Finance",
  "Food & Beverage", "Government", "Healthcare", "Hospitality", "Insurance", "Machinery", "Manufacturing",
  "Media", "Not For Profit", "Real Estate", "Recreation", "Retail", "Shipping", "Technology", "Other",
] as const;

export const ACCOUNT_TYPES = [
  "Analyst", "Competitor", "Customer", "Distributor", "Integrator", "Investor", "Individual", "Other",
  "Partner", "Press", "Prospect", "Reseller", "Supplier", "Vendor",
] as const;

export const COUNTRIES = ["India", "United States", "United Kingdom", "Singapore", "Australia", "UAE", "Other"] as const;

export const DEAL_STAGES = [
  "Qualification", "Needs Analysis", "Value Proposition", "Identify Decision Makers",
  "Proposal/Price Quote", "Negotiation/Review", "Closed Won",
] as const;
/** Default probability per stage — matches every stage transition recorded in the
 *  existing deal timelines (10→20→40→60→75). Negotiation/Review (never observed) uses 90. */
export const STAGE_PROBABILITY: Record<(typeof DEAL_STAGES)[number], number> = {
  Qualification: 10,
  "Needs Analysis": 20,
  "Value Proposition": 40,
  "Identify Decision Makers": 60,
  "Proposal/Price Quote": 75,
  "Negotiation/Review": 90,
  "Closed Won": 100,
};
export const DEAL_TYPES = ["New Business", "Existing Business"] as const;

export const TASK_STATUSES = ["To-Do", "In Progress", "Backlog", "Completed"] as const;
export const TASK_TYPES = ["Task", "Call", "Email", "Quote", "Meeting"] as const;

/* NEW — Calls module (required by handoff §7.7; absent pre-migration). */
export const CALL_DIRECTIONS = ["Outbound", "Inbound"] as const;
export const CALL_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;
export const CALL_OUTCOMES = ["Connected", "Left voicemail", "No answer", "Busy", "Wrong number"] as const;

/* NEW — Meetings module (required by handoff §7.7; absent pre-migration). */
export const MEETING_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;

export const ROLE_NAMES = [
  "Super Admin", "Administrator", "VP of Operations", "Operations Manager", "Team Leader", "Support Executive",
] as const;

export const RECORD_MODULES = ["leads", "contacts", "accounts", "deals"] as const;
export const ALL_MODULES = ["leads", "contacts", "accounts", "deals", "tasks", "calls", "meetings"] as const;

/** Permission matrix (pre-existing Settings ▸ Permissions). */
export const PERM_MODULES = [
  "Leads", "Deals", "Contacts", "Accounts", "Tasks", "Calls", "Meetings",
  "Users", "Organizations", "Roles", "Permissions", "Modules and Fields",
  "Import", "Export", "Data Backup", "Reports", "Dashboard Customization",
] as const;
export const PERM_ACTIONS = [
  "fullAccess", "create", "read", "update", "delete", "print", "import", "export", "email", "dataSharingPublic",
] as const;
export const PERM_ACTION_LABELS: Record<(typeof PERM_ACTIONS)[number], string> = {
  fullAccess: "Full access",
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  print: "Print",
  import: "Import",
  export: "Export",
  email: "Email",
  dataSharingPublic: "Data sharing (public)",
};
