/**
 * Seed dataset — built from the records hardcoded in the pre-migration pages
 * (app/leads/page.tsx, components/<module>/<Module>Detail.tsx, app/settings/page.tsx,
 * app/reports/page.tsx). Normalized so IDs cross-reference everywhere.
 *
 * Conflict resolution (list vs detail copies of the same record disagreed):
 *  - Detail record wins (it is the richer source), EXCEPT deal 13, where the list
 *    row was marked "exact from screenshot" and is used.
 *  - Deals 3/7/8/12 showed probability 0 in the list but 10 in detail + timeline → 10.
 *  - Deal 2's newest timeline entry moved it to Proposal/Price Quote, contradicting its
 *    current stage (Identify Decision Makers) → that entry is dropped.
 *  - Free-text owner names map to users: "PM SDL"→u1, "Admin"→u4, "SE User 1"→u8.
 *  - Times are interpreted in the org timezone (IST, +05:30).
 * No activities (calls, meetings, notes, emails) existed pre-migration, so none are seeded.
 */
import { DEAL_STAGES, PERM_ACTIONS, PERM_MODULES, ROLE_NAMES, STAGE_PROBABILITY } from "@/lib/schemas/options";
import type {
  Account, Contact, Dashboard, Db, Deal, DealStage, Lead, PermissionMatrix, Report, Role, StageChange, Task, User,
} from "@/lib/schemas";
import { emptyAddress } from "@/lib/schemas";

const t = (date: string, time = "09:00") => `${date}T${time}:00+05:30`;

/* ───────── users (Settings ▸ Users) + the EVOQ Tech Admin login account ───────── */
const U = (id: string, name: string, role: User["role"], email: string, first: string, last: string, phone = ""): User => ({
  id, name, role, email, firstName: first, lastName: last, phone, active: true, managerId: null, createdAt: t("2025-06-01"),
});
export const seedUsers: User[] = [
  U("0", "EVOQ Tech Admin", "Super Admin", "tech@evoq.one", "EVOQ Tech", "Admin"),
  U("1", "PM SDL", "Super Admin", "pm@socialdnalabs.com", "PM", "SDL", "7788778855"),
  U("2", "sdl aug0701", "Administrator", "sdlaug0701@mailinator.com", "sdl", "aug0701"),
  U("3", "Rajarajan N", "Administrator", "rajarajan.n@socialdnalabs.com", "Rajarajan", "N"),
  U("4", "Admin", "Administrator", "admin@mailinator.com", "Admin", ""),
  U("5", "crmuser", "Support Executive", "crmuser@mailinator.com", "crm", "user"),
  U("6", "Sales manager", "Operations Manager", "sdlsalesmanager@mailinator.com", "Sales", "manager"),
  U("7", "manager sdl", "Operations Manager", "sdlmanager@mailinator.com", "manager", "sdl"),
  U("8", "Support executive user1", "Support Executive", "seuser1@mailinator.com", "Support", "exec user1"),
  U("9", "Operation Manager user 1", "Operations Manager", "opmanageruser1@mailinator.com", "Operation", "Mgr user 1"),
  U("10", "Support executive user 2", "Support Executive", "seuser2@mailinator.com", "Support", "exec user 2"),
  U("11", "VP Operation User 1", "VP of Operations", "vpoperationuser1@mailinator.com", "VP Ops", "User 1"),
];

/* ───────── roles (Settings ▸ Roles tree) ───────── */
export const seedRoles: Role[] = [
  { id: "admin", name: "Administrator", description: "Full access administrator", reportsTo: null, department: "Management", createdAt: t("2025-09-01") },
  { id: "vp", name: "VP of Operations", description: "VP-level operations access", reportsTo: "admin", department: "Operations", createdAt: t("2025-10-15") },
  { id: "ops", name: "Operations Manager", description: "Manages operations team", reportsTo: "vp", department: "Operations", createdAt: t("2025-11-20") },
  { id: "se", name: "Support Executive", description: "Customer support role", reportsTo: "ops", department: "Support", createdAt: t("2025-12-01") },
  { id: "tl", name: "Team Leader", description: "Team leadership role", reportsTo: "admin", department: "Management", createdAt: t("2026-01-10") },
  { id: "sa", name: "Super Admin", description: "Super administrator with all permissions", reportsTo: "admin", department: "Management", createdAt: t("2025-09-05") },
];

/* ───────── leads (components/leads/LeadDetail.tsx) ───────── */
type LeadSeed = [id: string, sal: string, first: string, last: string, company: string, title: string, email: string,
  phone: string, mobile: string, website: string, status: Lead["status"], source: string, industry: string,
  rating: Lead["rating"], employees: string, revenue: number | null, owner: string, created: string, modified: string, description: string];
const leadRows: LeadSeed[] = [
  ["1", "Mrs.", "Shobha", "R", "Shobha Realty", "Director", "", "", "", "www.shobarealty.in", "New", "Web", "Real Estate", "Hot", "1–10", null, "1", "2026-05-27", "2026-05-27", ""],
  ["2", "Ms.", "Priya", "Nair", "Nair & Co", "Manager", "priya.nair@demo.com", "04425561234", "9988776655", "", "Contacted", "Referral", "Finance", "Warm", "11–50", 2500000, "8", "2025-02-02", "2026-04-15", "Interested in enterprise plan."],
  ["3", "Mr.", "John", "Carter", "Carter Traders", "CEO", "john.carter@demo.com", "", "9876543210", "www.cartertraders.com", "Qualified", "Cold Call", "Retail", "Hot", "51–200", 8000000, "8", "2025-02-02", "2026-05-10", "Looking for bulk pricing. Follow up next week."],
  ["4", "Mrs.", "Sudha", "R", "ddd", "", "Sudha@gmail.com", "", "76656564456544", "", "In Progress", "Advertisement", "Other", "Cold", "1–10", null, "4", "2025-07-22", "2025-07-22", ""],
  ["5", "", "Jaya", "56678", "", "", "", "", "76656564456544", "", "New", "Web", "", "", "", null, "4", "2025-07-22", "2025-07-22", ""],
  ["6", "Mr.", "Leo", "$#$#$#", "", "", "", "", "7865443322", "", "Unqualified", "Web", "", "Cold", "", null, "4", "2025-07-22", "2025-07-22", ""],
  ["7", "", "", "gfdsfs%$%^$^%$", "", "", "", "", "9876543212", "", "Lost", "", "", "", "", null, "4", "2025-07-22", "2025-07-22", ""],
  ["8", "", "", "335634656", "", "", "", "", "675432124578", "", "New", "", "", "", "", null, "4", "2025-07-22", "2025-07-22", ""],
  ["9", "Mr.", "", "Leo", "", "", "", "", "6757567456", "", "Contacted", "Web", "", "Cold", "", null, "4", "2025-07-22", "2025-07-22", ""],
  ["10", "Mr.", "James", "Wilson", "Wilson & Partners", "Partner", "james@wilson.com", "02244556677", "9876541234", "www.wilsonpartners.com", "Qualified", "Referral", "Finance", "Hot", "11–50", 12000000, "1", "2026-05-15", "2026-05-28", "High-value lead via Apex Solutions."],
  ["11", "Ms.", "Sara", "Kim", "TechFlow Ltd", "CTO", "sara.kim@techflow.io", "", "8765432109", "www.techflow.io", "In Progress", "Trade Show", "Technology", "Warm", "51–200", 5000000, "8", "2026-04-10", "2026-05-20", "Met at TechSummit 2026. Needs platform demo."],
  ["12", "Mr.", "Raj", "Mehta", "Apex Group", "MD", "raj@apex.in", "08033445566", "9845123456", "www.apexgroup.in", "New", "Web", "Manufacturing", "Hot", "200+", 50000000, "4", "2026-03-08", "2026-03-08", ""],
];
// Lead 7/8 had no last name in the source; their only name token is used as last name (required field).
export const seedLeads: Lead[] = leadRows.map((r) => ({
  id: r[0], salutation: r[1], firstName: r[2], lastName: r[3], company: r[4], title: r[5], email: r[6], phone: r[7],
  mobile: r[8], fax: "", website: r[9], status: r[10], leadSource: r[11], industry: r[12], rating: r[13], priority: "",
  noOfEmployees: r[14], annualRevenue: r[15], ownerId: r[16], emailOptOut: false, description: r[19], twitter: "",
  address: emptyAddress(), statusChangedAt: t(r[18]), converted: null, healthOverride: null, custom: {},
  createdAt: t(r[17]), updatedAt: t(r[18]), createdBy: r[16], updatedBy: r[16],
}));

/* ───────── accounts (components/accounts/AccountDetail.tsx + list) ───────── */
type AccSeed = [id: string, name: string, owner: string, phone: string, type: Account["accountType"], parent: string | null, created: string, createdTime: string, modified: string, modifiedTime: string];
const accRows: AccSeed[] = [
  ["1", "XYZ", "1", "01111111111", "", "2", "2026-05-27", "15:14", "2026-05-27", "15:14"],
  ["2", "Sweany Inc", "1", "6663636", "Individual", null, "2026-05-27", "14:38", "2026-05-27", "14:45"],
  ["3", "Lee Industries", "1", "", "Individual", null, "2026-05-15", "09:31", "2026-05-15", "09:31"],
  ["4", "SDL LEAD1", "1", "", "Individual", null, "2026-04-15", "11:13", "2026-04-15", "11:13"],
  ["5", "RMVT", "1", "", "Individual", null, "2026-04-14", "18:38", "2026-04-14", "18:43"],
  ["6", "test", "1", "9977887788", "Individual", null, "2026-04-13", "18:00", "2026-04-13", "18:17"],
  ["7", "Speedy Motors", "1", "", "Individual", null, "2026-04-13", "17:56", "2026-04-13", "17:56"],
  ["8", "SDL Test", "1", "", "Individual", null, "2026-03-16", "19:25", "2026-04-08", "16:47"],
  ["9", "Test 1233333", "1", "", "Individual", null, "2026-03-23", "17:16", "2026-03-23", "17:16"],
  ["10", "SDL", "1", "", "", null, "2025-06-26", "16:11", "2026-03-16", "19:45"],
  ["11", "Sears Homelife", "4", "", "", null, "2025-07-08", "11:15", "2026-03-16", "19:45"],
  ["12", "dfgdfg", "4", "", "", null, "2025-07-25", "17:16", "2026-03-16", "19:45"],
  ["13", "I&T", "4", "", "", null, "2025-07-28", "10:13", "2026-03-16", "19:45"],
  ["14", "dd", "4", "", "", null, "2025-07-28", "10:14", "2026-03-16", "19:45"],
];
export const seedAccounts: Account[] = accRows.map((r) => ({
  id: r[0], name: r[1], ownerId: r[2], phone: r[3], website: "", accountType: r[4], rating: "", accountSite: "", fax: "",
  parentAccountId: r[5], tickerSymbol: "", ownership: "", industry: "", employees: "", sicCode: "", annualRevenue: null,
  billing: emptyAddress(), shipping: emptyAddress(), description: "", custom: {},
  createdAt: t(r[6], r[7]), updatedAt: t(r[8], r[9]), createdBy: r[2], updatedBy: "1",
}));

/* ───────── contacts (components/contacts/ContactDetail.tsx + list) ───────── */
type ConSeed = [id: string, first: string, last: string, owner: string, email: string, phone: string, mobile: string, account: string | null, source: string, title: string, created: string, ct: string, modified: string, mt: string];
const conRows: ConSeed[] = [
  ["1", "Cop", "Mar", "1", "", "", "", "2", "Advertisement", "", "2026-05-27", "14:38", "2026-05-27", "14:38"],
  ["2", "Michael", "Lee", "1", "michael.lee@demo.com", "", "9123456780", null, "Web", "", "2026-05-15", "09:31", "2026-05-15", "09:31"],
  ["3", "Lead SDL", "11", "1", "leadsdl1@mailinator.com", "", "9999992222", "4", "Referral", "", "2026-04-15", "11:13", "2026-04-15", "11:13"],
  ["4", "John", "Smith", "1", "johnsmith@mailinator.com", "9898989898", "", "11", "Cold Call", "", "2026-04-13", "18:00", "2026-04-14", "19:45"],
  ["5", "Raja", "rajan", "1", "rajarajan@rmvt.com", "", "", "5", "Advertisement", "", "2026-04-14", "18:40", "2026-04-14", "19:30"],
  ["6", "mmmm", "mmmm", "1", "mmmm@rmvt.com", "", "", "5", "Advertisement", "", "2026-04-14", "18:53", "2026-04-14", "18:53"],
  ["7", "Vishnutharan", "R", "1", "vishnu@rmvt.com", "", "", "5", "Web", "", "2026-04-14", "18:38", "2026-04-14", "18:44"],
  ["8", "test", "test", "1", "test@mailinator.com", "", "", "6", "Web", "", "2026-04-13", "18:17", "2026-04-13", "18:17"],
  ["9", "Speedy", "Mike", "1", "", "", "0111111111", "7", "Cold Call", "", "2026-04-13", "17:56", "2026-04-13", "17:56"],
  ["10", "SDL Test", "Test", "1", "sdltest@mailinator.com", "9988776655", "", "10", "Web", "", "2026-03-17", "18:06", "2026-03-20", "17:13"],
  ["11", "SDL Mar 17", "SDL", "1", "", "77881122", "", "10", "Web", "", "2026-03-17", "11:32", "2026-03-17", "11:34"],
  ["12", "Jimmy", "Davis", "4", "", "8877994455", "", null, "Cold Call", "", "2025-07-08", "11:14", "2026-03-17", "11:32"],
  ["13", "Test", "user001", "4", "", "9978654311", "", null, "Web", "", "2025-08-20", "11:57", "2026-02-05", "18:50"],
];
export const seedContacts: Contact[] = conRows.map((r) => ({
  id: r[0], salutation: "", firstName: r[1], lastName: r[2], accountId: r[7], ownerId: r[3], email: r[4], secondaryEmail: "",
  phone: r[5], mobile: r[6], otherPhone: "", homePhone: "", fax: "", title: r[9], department: "", leadSource: r[8],
  assistant: "", asstPhone: "", dateOfBirth: "", emailOptOut: false, skypeId: "", twitter: "", reportingToId: null,
  mailing: emptyAddress(), other: emptyAddress(), description: "", custom: {},
  createdAt: t(r[10], r[11]), updatedAt: t(r[12], r[13]), createdBy: r[3], updatedBy: "1",
}));

/* ───────── deals (components/deals/DealDetail.tsx; deal 13 from list) ───────── */
type Hist = [date: string, time: string, from: DealStage | null, to: DealStage, pFrom: number, pTo: number];
type DealSeed = [id: string, name: string, amount: number, account: string | null, contact: string | null, stage: DealStage,
  type: Deal["type"], nextStep: string, source: string, close: string, created: string, ct: string, modified: string, mt: string, description: string, history: Hist[]];
const dealRows: DealSeed[] = [
  ["1", "New", 29999, "2", null, "Proposal/Price Quote", "New Business", "Send proposal", "Web", "2026-07-15", "2026-05-27", "15:14", "2026-05-30", "14:10", "",
    [["2026-05-27", "15:14", null, "Qualification", 0, 20], ["2026-05-29", "10:22", "Qualification", "Needs Analysis", 20, 60], ["2026-05-30", "14:10", "Needs Analysis", "Proposal/Price Quote", 60, 75]]],
  ["2", "Deal SDL 11", 500000, "4", "3", "Identify Decision Makers", "Existing Business", "Schedule meeting", "Referral", "2026-08-31", "2026-04-15", "11:13", "2026-05-05", "16:55", "Enterprise deal with SDL LEAD1.",
    [["2026-05-05", "16:50", "Qualification", "Needs Analysis", 10, 20], ["2026-05-05", "16:50", "Needs Analysis", "Value Proposition", 20, 40], ["2026-05-05", "16:55", "Value Proposition", "Needs Analysis", 40, 20], ["2026-05-05", "16:55", "Needs Analysis", "Value Proposition", 20, 40], ["2026-05-05", "16:55", "Value Proposition", "Identify Decision Makers", 40, 60]]],
  ["3", "test deal john smith", 200000, "11", "4", "Qualification", "New Business", "", "Cold Call", "2026-09-30", "2026-04-14", "19:45", "2026-04-14", "19:45", "", [["2026-04-14", "19:45", null, "Qualification", 0, 10]]],
  ["4", "testing", 500000, "5", "5", "Needs Analysis", "Existing Business", "", "Advertisement", "2026-07-31", "2026-04-14", "19:30", "2026-04-14", "19:34", "",
    [["2026-04-14", "19:30", null, "Qualification", 0, 10], ["2026-04-14", "19:34", "Qualification", "Needs Analysis", 10, 20]]],
  ["5", "fsm enterprise application", 800000, "5", "6", "Needs Analysis", "New Business", "Demo scheduled", "Advertisement", "2026-10-31", "2026-04-14", "18:53", "2026-04-14", "19:07", "Full FSM enterprise application build.",
    [["2026-04-14", "18:53", null, "Qualification", 0, 10], ["2026-04-14", "19:07", "Qualification", "Needs Analysis", 10, 20]]],
  ["6", "CRM Application", 200000, "10", "10", "Qualification", "New Business", "", "Web", "2026-08-15", "2026-04-14", "19:04", "2026-04-14", "19:04", "", [["2026-04-14", "19:04", null, "Qualification", 0, 10]]],
  ["7", "fsm single user application", 200000, "5", "5", "Qualification", "New Business", "", "Advertisement", "2026-09-15", "2026-04-14", "18:40", "2026-04-14", "18:40", "", [["2026-04-14", "18:40", null, "Qualification", 0, 10]]],
  ["8", "CRM Application", 500000, "5", "7", "Qualification", "New Business", "", "Web", "2026-10-01", "2026-04-14", "18:38", "2026-04-14", "18:38", "", [["2026-04-14", "18:38", null, "Qualification", 0, 10]]],
  ["9", "Deal test", 150000, "6", "8", "Qualification", "New Business", "", "Web", "2026-07-01", "2026-04-13", "18:35", "2026-04-13", "18:35", "", [["2026-04-13", "18:35", null, "Qualification", 0, 10]]],
  ["10", "test", 50000, "6", "8", "Needs Analysis", "New Business", "", "Web", "2026-08-01", "2026-04-13", "18:17", "2026-04-13", "18:34", "",
    [["2026-04-13", "18:17", null, "Qualification", 0, 10], ["2026-04-13", "18:34", "Qualification", "Needs Analysis", 10, 20]]],
  ["11", "Smith", 100000, "6", "4", "Value Proposition", "New Business", "Send proposal doc", "Referral", "2026-09-01", "2026-04-13", "18:00", "2026-04-13", "18:02", "",
    [["2026-04-13", "18:00", null, "Qualification", 0, 10], ["2026-04-13", "18:00", "Qualification", "Needs Analysis", 10, 20], ["2026-04-13", "18:02", "Needs Analysis", "Value Proposition", 20, 40]]],
  ["12", "Mike", 0, "7", "9", "Qualification", "New Business", "", "Cold Call", "2026-12-31", "2026-04-13", "17:56", "2026-04-13", "17:56", "", [["2026-04-13", "17:56", null, "Qualification", 0, 10]]],
  ["13", "Test", 10000, "10", null, "Proposal/Price Quote", "Existing Business", "", "Advertisement", "2026-06-30", "2026-03-25", "20:10", "2026-04-07", "16:53", "test", [["2026-03-25", "20:10", null, "Proposal/Price Quote", 0, 75]]],
];
export const seedDeals: Deal[] = dealRows.map((r) => {
  const history: StageChange[] = r[15].map((h) => ({
    at: t(h[0], h[1]), by: "1", from: h[2], to: h[3], probabilityFrom: h[4], probabilityTo: h[5], amount: r[2],
  }));
  const last = history[history.length - 1];
  return {
    id: r[0], refId: `CRM-DEAL-2026-${r[0].padStart(5, "0")}`, name: r[1], amount: r[2], ownerId: "1", accountId: r[3],
    contactId: r[4], stage: r[5], type: r[6], nextStep: r[7], probability: STAGE_PROBABILITY[r[5]], leadSource: r[8],
    closingDate: r[9], description: r[14], stageChangedAt: last?.at ?? t(r[10], r[11]), stageHistory: history,
    fromLeadId: null, custom: {}, createdAt: t(r[10], r[11]), updatedAt: t(r[12], r[13]), createdBy: "1", updatedBy: "1",
  };
});

/* ───────── tasks (app/tasks/page.tsx + TaskDetail.tsx) ───────── */
const task = (id: string, subject: string, type: Task["type"], due: string | null, status: Task["status"], priority: Task["priority"],
  contactId: string | null, related: Task["related"], created: string, ct: string, description = ""): Task => ({
  id, subject, type, dueDate: due, status, priority, ownerId: "1", assigneeId: "1", contactId, related, reminder: "",
  description, completedAt: null, createdAt: t(created, ct), updatedAt: t(created, ct), createdBy: "1", updatedBy: "1",
});
export const seedTasks: Task[] = [
  task("1", "New", "Task", null, null, null, null, null, "2026-05-27", "14:47"),
  task("2", "New", "Task", "2026-05-07", "To-Do", null, null, null, "2026-05-07", "09:00"),
  task("3", "Schedule Demo", "Task", "2026-04-17", "Backlog", "High", "10", { module: "accounts", id: "10" }, "2026-04-17", "10:15", "Schedule a product demo with SDL team."),
  task("4", "Prepare quote sent to email", "Task", "2026-04-16", "Backlog", "Medium", "10", { module: "accounts", id: "10" }, "2026-04-16", "14:30", "Prepare and send the quote document via email."),
  task("5", "Quote", "Quote", "2026-03-24", "In Progress", "Low", null, null, "2026-03-24", "11:00"),
];

/* ───────── reports (app/reports/page.tsx SAMPLE_REPORTS → real configs) ───────── */
const rep = (id: string, name: string, description: string, collection: string, partial: Partial<Report>, tags: string[], pinned: boolean, owner: string, accessed: string | null): Report => ({
  id, name, description, collection, source: "deals", joins: [], columns: [], filters: [], dateField: null, dateRange: "all",
  groupBy: null, measure: { op: "count", field: null }, visualization: "table", tags, pinned, ownerId: owner,
  createdAt: t("2026-05-01"), updatedAt: t("2026-05-01"), lastAccessedAt: accessed, ...partial,
});
export const seedReports: Report[] = [
  rep("r1", "Deal 30", "Open deals with value, stage and closing date", "Deal Reports", { columns: ["name", "accountId", "stage", "amount", "probability", "closingDate", "ownerId"] }, ["deals", "sales", "active"], true, "1", t("2026-06-22")),
  rep("r2", "Deal with Stage", "Deal count by stage", "Deal Reports", { groupBy: "stage", visualization: "column" }, ["deals", "pipeline", "analytics"], false, "1", t("2026-06-22")),
  rep("r3", "Deal List", "", "Deal Reports", { columns: ["name", "accountId", "contactId", "stage", "amount", "ownerId"] }, ["deals", "sales"], false, "1", t("2026-06-19")),
  rep("r4", "Account Wise Deal Summary", "Total deal amount per account", "Deal Reports", { groupBy: "accountId", measure: { op: "sum", field: "amount" }, visualization: "bar", joins: ["accounts"] }, ["accounts", "deals", "summary"], false, "4", t("2026-06-05")),
  rep("r5", "Account List", "All accounts with industry and revenue", "Account Reports", { source: "accounts", columns: ["name", "accountType", "industry", "annualRevenue", "phone", "ownerId"] }, ["accounts", "industry"], false, "1", t("2026-06-10")),
];

/* ───────── dashboard (Settings ▸ Dashboard Customization "Dashboard V1") ───────── */
export const seedDashboards: Dashboard[] = [{
  id: "hp1", name: "Dashboard V1", description: "Daily sales operating overview", visibility: "all", roles: [], locked: false, ownerId: "1",
  createdAt: t("2026-05-01"), updatedAt: t("2026-05-01"),
  widgets: [
    { id: "w1", kind: "metric", key: "open_leads", reportId: null, title: "Open leads", span: 1, visualization: "kpi" },
    { id: "w2", kind: "metric", key: "open_deals", reportId: null, title: "Open deals", span: 1, visualization: "kpi" },
    { id: "w3", kind: "metric", key: "pipeline_value", reportId: null, title: "Pipeline value", span: 1, visualization: "kpi" },
    { id: "w4", kind: "metric", key: "tasks_due", reportId: null, title: "Tasks due today", span: 1, visualization: "kpi" },
    { id: "w5", kind: "metric", key: "deals_by_stage", reportId: null, title: "Pipeline by stage", span: 2, visualization: "bar" },
    { id: "w6", kind: "worklist", key: "my_work", reportId: null, title: "My upcoming work", span: 2, visualization: null },
    { id: "w7", kind: "metric", key: "forecast_vs_actual", reportId: null, title: "Forecast vs actual", span: 2, visualization: "column" },
    { id: "w8", kind: "worklist", key: "attention", reportId: null, title: "Needs attention", span: 2, visualization: null },
    { id: "w9", kind: "metric", key: "lead_funnel", reportId: null, title: "Lead funnel", span: 2, visualization: "bar" },
    { id: "w10", kind: "worklist", key: "recent_activity", reportId: null, title: "Recent activity", span: 2, visualization: null },
  ],
}];

/* ───────── permissions (Settings ▸ Permissions defaults: all granted) ───────── */
function defaultPermissions(): PermissionMatrix {
  const m: PermissionMatrix = {};
  for (const mod of PERM_MODULES) {
    m[mod] = {};
    for (const role of ROLE_NAMES) {
      m[mod][role] = Object.fromEntries(PERM_ACTIONS.map((a) => [a, true]));
    }
  }
  return m;
}

export function buildSeed(): Db {
  return {
    version: 1,
    users: seedUsers, roles: seedRoles, leads: seedLeads, accounts: seedAccounts, contacts: seedContacts, deals: seedDeals,
    tasks: seedTasks, calls: [], meetings: [], notes: [], comments: [], attachments: [], emails: [], audit: [], agentActions: [],
    views: [], reports: seedReports, dashboards: seedDashboards,
    settings: {
      org: {
        name: "Social DNA Labs", website: "www.socialdnalabs.com", phone: "9988775566", email: "pm@socialdnalabs.com",
        currency: "INR", timezone: "Asia/Kolkata", fiscalYearStartMonth: 4, address: { ...emptyAddress(), country: "India" },
      },
      email: { fromName: "Social DNA Labs", replyTo: "", signature: "", bccSelf: false },
      modules: [
        { key: "leads", singular: "Lead", plural: "Leads", enabled: true },
        { key: "deals", singular: "Deal", plural: "Deals", enabled: true },
        { key: "contacts", singular: "Contact", plural: "Contacts", enabled: true },
        { key: "accounts", singular: "Account", plural: "Accounts", enabled: true },
        { key: "tasks", singular: "Task", plural: "Tasks", enabled: true },
        { key: "calls", singular: "Call", plural: "Calls", enabled: true },
        { key: "meetings", singular: "Meeting", plural: "Meetings", enabled: true },
      ],
      customFields: [], layouts: [], permissions: defaultPermissions(), activeDashboardId: "hp1",
    },
    counters: { leads: 12, accounts: 14, contacts: 13, deals: 13, tasks: 5, calls: 0, meetings: 0, notes: 0, comments: 0, attachments: 0, emails: 0, audit: 0, agentActions: 0, views: 0, reports: 5, dashboards: 1, users: 11, roles: 0, customFields: 0 },
  };
}

export const STAGES = DEAL_STAGES;
