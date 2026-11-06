import { z } from "zod";
import {
  ACCOUNT_TYPES, ALL_MODULES, CALL_DIRECTIONS, CALL_OUTCOMES, CALL_STATUSES, DEAL_STAGES, DEAL_TYPES,
  LEAD_STATUSES, MEETING_STATUSES, PERM_ACTIONS, PRIORITIES, RATINGS, RECORD_MODULES,
  TASK_STATUSES, TASK_TYPES,
} from "./options";

/* ───────────── primitives ───────────── */
export const Id = z.string().min(1);
export const IsoDateTime = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date/time");
/** yyyy-mm-dd */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");
const optText = (max = 255) => z.string().trim().max(max).default("");
/** Empty string or a valid email. */
export const OptEmail = z.union([z.literal(""), z.email("Enter a valid email address")]).default("");
/** Empty or a plausible phone (digits, spaces, + - ( ) ; 6–20 digits). */
export const OptPhone = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || (/^[+()\-\s\d]+$/.test(v) && v.replace(/\D/g, "").length >= 6 && v.replace(/\D/g, "").length <= 20), "Enter a valid phone number");
export const OptUrl = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(v), "Enter a valid website");

export const RecordModule = z.enum(RECORD_MODULES);
export type RecordModule = z.infer<typeof RecordModule>;
export const ModuleKey = z.enum(ALL_MODULES);
export type ModuleKey = z.infer<typeof ModuleKey>;

/** Reference to the record an activity belongs to. */
export const RecordRef = z.object({ module: RecordModule, id: Id });
export type RecordRef = z.infer<typeof RecordRef>;

export const Address = z.object({
  street: optText(), city: optText(120), state: optText(120), zip: optText(20), country: optText(120),
});
export type Address = z.infer<typeof Address>;
export const emptyAddress = (): Address => ({ street: "", city: "", state: "", zip: "", country: "" });

const Audit = {
  createdAt: IsoDateTime, updatedAt: IsoDateTime, createdBy: Id, updatedBy: Id,
};

export const CustomValues = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({});

/* ───────────── users, roles, permissions ───────────── */
/** Roles are data (Settings ▸ Roles), so a role name is any non-empty string. ROLE_NAMES lists the built-in ones. */
export const RoleName = z.string().min(1);
export const User = z.object({
  id: Id, firstName: optText(80), lastName: optText(80), name: z.string().min(1),
  email: z.email(), phone: OptPhone, role: RoleName, active: z.boolean().default(true),
  /** Manager this user reports to (team scope for manager visibility). */
  managerId: Id.nullable().default(null),
  createdAt: IsoDateTime,
});
export type User = z.infer<typeof User>;

export const Role = z.object({
  id: Id, name: z.string().min(1).max(80), description: optText(500), reportsTo: Id.nullable(),
  department: optText(80), createdAt: IsoDateTime,
});
export type Role = z.infer<typeof Role>;

export const PermAction = z.enum(PERM_ACTIONS);
export type PermAction = z.infer<typeof PermAction>;
/** matrix[permModule][roleName][action] */
export const PermissionMatrix = z.record(z.string(), z.record(z.string(), z.record(z.string(), z.boolean())));
export type PermissionMatrix = z.infer<typeof PermissionMatrix>;

/* ───────────── core records ───────────── */
export const HealthBand = z.enum(["Healthy", "Watch", "At risk"]);
export type HealthBand = z.infer<typeof HealthBand>;
export const HealthOverride = z.object({
  band: HealthBand, reason: z.string().trim().min(3, "Give a reason (min 3 characters)").max(500),
  by: Id, at: IsoDateTime,
});
export type HealthOverride = z.infer<typeof HealthOverride>;

export const Lead = z.object({
  id: Id, salutation: optText(10), firstName: optText(80), lastName: z.string().trim().min(1, "Last name is required").max(80),
  company: optText(), title: optText(120), email: OptEmail, phone: OptPhone, mobile: OptPhone, fax: optText(40),
  website: OptUrl, status: z.enum(LEAD_STATUSES), leadSource: optText(60), industry: optText(60),
  rating: z.union([z.enum(RATINGS), z.literal("")]).default(""),
  priority: z.union([z.enum(PRIORITIES), z.literal("")]).default(""),
  noOfEmployees: optText(20), annualRevenue: z.number().nonnegative().nullable().default(null),
  ownerId: Id.nullable(), emailOptOut: z.boolean().default(false), description: optText(4000),
  twitter: optText(80), address: Address.default(emptyAddress),
  statusChangedAt: IsoDateTime,
  converted: z.object({ at: IsoDateTime, by: Id, accountId: Id, contactId: Id, dealId: Id.nullable() }).nullable().default(null),
  healthOverride: HealthOverride.nullable().default(null),
  custom: CustomValues,
  ...Audit,
});
export type Lead = z.infer<typeof Lead>;

export const Account = z.object({
  id: Id, name: z.string().trim().min(1, "Account name is required").max(160), ownerId: Id.nullable(),
  phone: OptPhone, website: OptUrl, accountType: z.union([z.enum(ACCOUNT_TYPES), z.literal("")]).default(""),
  rating: z.union([z.enum(RATINGS), z.literal("")]).default(""), accountSite: optText(), fax: optText(40),
  parentAccountId: Id.nullable().default(null), tickerSymbol: optText(20), ownership: optText(60), industry: optText(60),
  employees: optText(20), sicCode: optText(20), annualRevenue: z.number().nonnegative().nullable().default(null),
  billing: Address.default(emptyAddress), shipping: Address.default(emptyAddress), description: optText(4000),
  custom: CustomValues,
  ...Audit,
});
export type Account = z.infer<typeof Account>;

export const Contact = z.object({
  id: Id, salutation: optText(10), firstName: optText(80), lastName: z.string().trim().min(1, "Last name is required").max(80),
  accountId: Id.nullable().default(null), ownerId: Id.nullable(), email: OptEmail, secondaryEmail: OptEmail,
  phone: OptPhone, mobile: OptPhone, otherPhone: OptPhone, homePhone: OptPhone, fax: optText(40),
  title: optText(120), department: optText(120), leadSource: optText(60), assistant: optText(120), asstPhone: OptPhone,
  dateOfBirth: z.union([z.literal(""), IsoDate]).default(""), emailOptOut: z.boolean().default(false),
  skypeId: optText(80), twitter: optText(80), reportingToId: Id.nullable().default(null),
  mailing: Address.default(emptyAddress), other: Address.default(emptyAddress), description: optText(4000),
  custom: CustomValues,
  ...Audit,
});
export type Contact = z.infer<typeof Contact>;

export const DealStage = z.enum(DEAL_STAGES);
export type DealStage = z.infer<typeof DealStage>;
export const StageChange = z.object({
  at: IsoDateTime, by: Id, from: DealStage.nullable(), to: DealStage,
  probabilityFrom: z.number().nullable(), probabilityTo: z.number(), amount: z.number(),
});
export type StageChange = z.infer<typeof StageChange>;

export const Deal = z.object({
  id: Id, refId: z.string(), name: z.string().trim().min(1, "Deal name is required").max(160),
  amount: z.number({ error: "Enter an amount" }).nonnegative("Amount cannot be negative"), ownerId: Id.nullable(),
  accountId: Id.nullable().default(null), contactId: Id.nullable().default(null), stage: DealStage,
  type: z.union([z.enum(DEAL_TYPES), z.literal("")]).default(""), nextStep: optText(255),
  probability: z.number().min(0).max(100), leadSource: optText(60), closingDate: IsoDate,
  description: optText(4000), stageChangedAt: IsoDateTime, stageHistory: z.array(StageChange).default([]),
  fromLeadId: Id.nullable().default(null),
  custom: CustomValues,
  ...Audit,
});
export type Deal = z.infer<typeof Deal>;

/* ───────────── activities ───────────── */
export const Task = z.object({
  id: Id, subject: z.string().trim().min(1, "Subject is required").max(255),
  type: z.enum(TASK_TYPES).default("Task"), dueDate: IsoDate.nullable().default(null),
  status: z.enum(TASK_STATUSES).nullable().default("To-Do"), priority: z.enum(PRIORITIES).nullable().default(null),
  ownerId: Id.nullable(), assigneeId: Id.nullable().default(null), contactId: Id.nullable().default(null),
  related: RecordRef.nullable().default(null), reminder: z.union([z.literal(""), IsoDateTime]).default(""),
  description: optText(4000), completedAt: IsoDateTime.nullable().default(null),
  ...Audit,
});
export type Task = z.infer<typeof Task>;

export const Call = z.object({
  id: Id, subject: z.string().trim().min(1, "Subject is required").max(255),
  direction: z.enum(CALL_DIRECTIONS), status: z.enum(CALL_STATUSES), scheduledAt: IsoDateTime,
  durationMin: z.number().int().min(0).max(600).nullable().default(null),
  outcome: z.union([z.enum(CALL_OUTCOMES), z.literal("")]).default(""), phone: OptPhone,
  ownerId: Id.nullable(), contactId: Id.nullable().default(null), related: RecordRef.nullable().default(null),
  description: optText(4000), completedAt: IsoDateTime.nullable().default(null),
  ...Audit,
});
export type Call = z.infer<typeof Call>;

export const Meeting = z.object({
  id: Id, title: z.string().trim().min(1, "Title is required").max(255), startAt: IsoDateTime, endAt: IsoDateTime,
  location: optText(255), status: z.enum(MEETING_STATUSES), ownerId: Id.nullable(),
  participantContactIds: z.array(Id).default([]), participantUserIds: z.array(Id).default([]),
  related: RecordRef.nullable().default(null), description: optText(4000), outcome: optText(4000),
  completedAt: IsoDateTime.nullable().default(null),
  ...Audit,
});
export type Meeting = z.infer<typeof Meeting>;

export const Note = z.object({
  id: Id, related: RecordRef, body: z.string().trim().min(1, "Write something first").max(8000),
  authorId: Id, createdAt: IsoDateTime, updatedAt: IsoDateTime,
});
export type Note = z.infer<typeof Note>;

export const Comment = z.object({
  id: Id, related: RecordRef, body: z.string().trim().min(1, "Write something first").max(4000),
  authorId: Id, createdAt: IsoDateTime,
});
export type Comment = z.infer<typeof Comment>;

/** Attachment metadata + (small) inline content. Real file storage is a backend dependency. */
export const Attachment = z.object({
  id: Id, related: RecordRef, name: z.string().min(1).max(255), size: z.number().int().nonnegative(),
  mime: z.string(), dataUrl: z.string().nullable(), uploadedBy: Id, createdAt: IsoDateTime,
});
export type Attachment = z.infer<typeof Attachment>;

/** Emails are LOGGED, not sent — there is no email integration (handoff: "do not invent integrations"). */
export const EmailLog = z.object({
  id: Id, related: RecordRef, direction: z.enum(["Sent", "Received"]),
  to: z.string().trim().max(500).default(""), subject: z.string().trim().min(1, "Subject is required").max(255),
  body: optText(8000), at: IsoDateTime, ownerId: Id, createdAt: IsoDateTime,
});
export type EmailLog = z.infer<typeof EmailLog>;

export const AuditEvent = z.object({
  id: Id, related: RecordRef,
  action: z.enum(["created", "updated", "status_changed", "stage_changed", "owner_changed", "converted", "health_override", "deleted_activity"]),
  changes: z.array(z.object({ field: z.string(), from: z.string(), to: z.string() })).default([]),
  by: Id, at: IsoDateTime,
});
export type AuditEvent = z.infer<typeof AuditEvent>;

/* ───────────── EVI agent actions ───────────── */
export const AgentActionKind = z.enum(["create_task", "draft_email", "schedule_meeting", "set_priority"]);
export const AgentActionStatus = z.enum(["proposed", "approved", "rejected", "running", "succeeded", "failed"]);
export const AgentAction = z.object({
  id: Id, kind: AgentActionKind, status: AgentActionStatus, related: RecordRef,
  title: z.string(), rationale: z.string(), payload: z.record(z.string(), z.unknown()),
  proposedAt: IsoDateTime, requestedBy: Id,
  decidedBy: Id.nullable().default(null), decidedAt: IsoDateTime.nullable().default(null),
  attempts: z.number().int().default(0), result: z.string().nullable().default(null), error: z.string().nullable().default(null),
  history: z.array(z.object({ at: IsoDateTime, by: z.string(), event: z.string() })).default([]),
});
export type AgentAction = z.infer<typeof AgentAction>;

/* ───────────── views, reports, dashboards ───────────── */
export const FilterOp = z.enum(["is", "is_not", "contains", "not_contains", "is_empty", "is_not_empty", "gt", "lt", "before", "after"]);
export type FilterOp = z.infer<typeof FilterOp>;
export const FilterRule = z.object({ field: z.string(), op: FilterOp, value: z.string().default("") });
export type FilterRule = z.infer<typeof FilterRule>;
export const SortRule = z.object({ field: z.string(), dir: z.enum(["asc", "desc"]) });
export type SortRule = z.infer<typeof SortRule>;

export const SavedView = z.object({
  id: Id, module: ModuleKey, name: z.string().trim().min(1, "Name the view").max(60),
  search: z.string().default(""), filters: z.array(FilterRule).default([]), sort: z.array(SortRule).default([]),
  columns: z.array(z.string()).default([]), ownerId: Id, shared: z.boolean().default(false), createdAt: IsoDateTime,
});
export type SavedView = z.infer<typeof SavedView>;

export const ReportSource = z.enum(["leads", "contacts", "accounts", "deals", "tasks", "calls", "meetings"]);
export const Visualization = z.enum(["table", "bar", "column", "line", "area", "pie", "donut", "kpi"]);
export type Visualization = z.infer<typeof Visualization>;
export const Measure = z.object({ op: z.enum(["count", "sum", "avg"]), field: z.string().nullable().default(null) });
export const Report = z.object({
  id: Id, name: z.string().trim().min(1, "Name the report").max(120), description: optText(500),
  collection: z.string().trim().min(1).max(60).default("My Reports"), source: ReportSource,
  /** Related modules joined in (pre-existing module-relationship builder). */
  joins: z.array(ReportSource).default([]),
  columns: z.array(z.string()).default([]), filters: z.array(FilterRule).default([]),
  dateField: z.string().nullable().default(null),
  dateRange: z.enum(["all", "this_month", "last_30", "this_quarter", "this_year"]).default("all"),
  groupBy: z.string().nullable().default(null), measure: Measure.default({ op: "count", field: null }),
  visualization: Visualization.default("table"), tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false), ownerId: Id, createdAt: IsoDateTime, updatedAt: IsoDateTime,
  lastAccessedAt: IsoDateTime.nullable().default(null),
});
export type Report = z.infer<typeof Report>;

export const Widget = z.object({
  id: Id, kind: z.enum(["metric", "report", "worklist"]),
  /** metric key from lib/domain/metrics, or worklist key */
  key: z.string().nullable().default(null), reportId: Id.nullable().default(null),
  title: z.string().trim().min(1).max(80), span: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
  visualization: Visualization.nullable().default(null),
});
export type Widget = z.infer<typeof Widget>;
export const Dashboard = z.object({
  id: Id, name: z.string().trim().min(1, "Name the dashboard").max(80), description: optText(300),
  visibility: z.enum(["private", "all", "roles"]).default("all"), roles: z.array(RoleName).default([]),
  locked: z.boolean().default(false), widgets: z.array(Widget), ownerId: Id, createdAt: IsoDateTime, updatedAt: IsoDateTime,
});
export type Dashboard = z.infer<typeof Dashboard>;

/* ───────────── settings ───────────── */
export const CustomField = z.object({
  id: Id, module: RecordModule, key: z.string().regex(/^[a-z][a-z0-9_]*$/, "Lowercase letters, digits and _ only"),
  label: z.string().trim().min(1, "Label is required").max(60),
  type: z.enum(["text", "number", "date", "select", "checkbox"]), options: z.array(z.string()).default([]),
  required: z.boolean().default(false), createdAt: IsoDateTime,
});
export type CustomField = z.infer<typeof CustomField>;

export const OrgSettings = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(120), website: OptUrl, phone: OptPhone,
  email: OptEmail, currency: z.enum(["INR", "USD", "EUR", "GBP", "AED", "SGD"]).default("INR"),
  timezone: z.string().default("Asia/Kolkata"), fiscalYearStartMonth: z.number().int().min(1).max(12).default(4),
  address: Address.default(emptyAddress),
});
export type OrgSettings = z.infer<typeof OrgSettings>;

export const EmailSettings = z.object({
  fromName: optText(120), replyTo: OptEmail, signature: optText(2000), bccSelf: z.boolean().default(false),
});
export type EmailSettings = z.infer<typeof EmailSettings>;

export const ModuleConfig = z.object({
  key: ModuleKey, singular: z.string().trim().min(1).max(40), plural: z.string().trim().min(1).max(40), enabled: z.boolean(),
});
export type ModuleConfig = z.infer<typeof ModuleConfig>;

/** Field visibility/order per module in the detail view (pre-existing Layouts editor). */
export const Layout = z.object({
  module: RecordModule, sections: z.array(z.object({ id: Id, title: z.string().min(1).max(60), fields: z.array(z.string()) })),
  updatedAt: IsoDateTime,
});
export type Layout = z.infer<typeof Layout>;

export const Settings = z.object({
  org: OrgSettings, email: EmailSettings, modules: z.array(ModuleConfig), customFields: z.array(CustomField),
  layouts: z.array(Layout).default([]), permissions: PermissionMatrix, activeDashboardId: Id.nullable().default(null),
});
export type Settings = z.infer<typeof Settings>;

/* ───────────── whole store ───────────── */
export const Db = z.object({
  version: z.literal(1),
  users: z.array(User), roles: z.array(Role),
  leads: z.array(Lead), accounts: z.array(Account), contacts: z.array(Contact), deals: z.array(Deal),
  tasks: z.array(Task), calls: z.array(Call), meetings: z.array(Meeting),
  notes: z.array(Note), comments: z.array(Comment), attachments: z.array(Attachment), emails: z.array(EmailLog),
  audit: z.array(AuditEvent), agentActions: z.array(AgentAction),
  views: z.array(SavedView), reports: z.array(Report), dashboards: z.array(Dashboard),
  settings: Settings, counters: z.record(z.string(), z.number()),
});
export type Db = z.infer<typeof Db>;

export type Collection = Exclude<keyof Db, "version" | "settings" | "counters">;
