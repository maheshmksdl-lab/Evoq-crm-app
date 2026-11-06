import {
  ACCOUNT_TYPES, CALL_DIRECTIONS, CALL_OUTCOMES, CALL_STATUSES, COUNTRIES, DEAL_STAGES, DEAL_TYPES, EMPLOYEE_BANDS,
  INDUSTRIES, LEAD_SOURCES, LEAD_STATUSES, MEETING_STATUSES, PRIORITIES, RATINGS, SALUTATIONS, TASK_STATUSES, TASK_TYPES,
} from "@/lib/schemas/options";
import type { ModuleKey } from "@/lib/schemas";

/**
 * Field registry — one definition per field drives table columns, filters, sorting,
 * CSV import/export, the report builder and detail layouts.
 * `derived` fields are computed (health, next action…) and are read-only.
 */
export type FieldType = "text" | "email" | "phone" | "url" | "number" | "money" | "percent" | "date" | "datetime" | "select" | "user" | "ref" | "boolean" | "textarea";
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  ref?: "accounts" | "contacts" | "deals" | "leads";
  derived?: boolean;
  /** shown in "Additional details" rather than the main summary */
  group?: string;
  required?: boolean;
}

const F = (key: string, label: string, type: FieldType, extra: Partial<FieldDef> = {}): FieldDef => ({ key, label, type, ...extra });
const audit: FieldDef[] = [
  F("createdAt", "Created", "datetime", { group: "System" }),
  F("updatedAt", "Modified", "datetime", { group: "System" }),
];

export const FIELDS: Record<ModuleKey, FieldDef[]> = {
  leads: [
    F("name", "Lead", "text", { derived: true }),
    F("salutation", "Salutation", "select", { options: SALUTATIONS, group: "Lead information" }),
    F("firstName", "First name", "text", { group: "Lead information" }),
    F("lastName", "Last name", "text", { group: "Lead information", required: true }),
    F("company", "Company", "text", { group: "Lead information" }),
    F("title", "Title", "text", { group: "Lead information" }),
    F("email", "Email", "email", { group: "Lead information" }),
    F("phone", "Phone", "phone", { group: "Lead information" }),
    F("mobile", "Mobile", "phone", { group: "Lead information" }),
    F("status", "Status", "select", { options: LEAD_STATUSES, group: "Lead information", required: true }),
    F("priority", "Priority", "select", { options: PRIORITIES, group: "Lead information" }),
    F("rating", "Rating", "select", { options: RATINGS, group: "Lead information" }),
    F("leadSource", "Lead source", "select", { options: LEAD_SOURCES, group: "Lead information" }),
    F("ownerId", "Owner", "user", { group: "Lead information" }),
    F("industry", "Industry", "select", { options: INDUSTRIES, group: "Company" }),
    F("noOfEmployees", "No. of employees", "select", { options: EMPLOYEE_BANDS, group: "Company" }),
    F("annualRevenue", "Annual revenue", "money", { group: "Company" }),
    F("website", "Website", "url", { group: "Company" }),
    F("fax", "Fax", "text", { group: "Company" }),
    F("twitter", "Twitter", "text", { group: "Company" }),
    F("emailOptOut", "Email opt-out", "boolean", { group: "Lead information" }),
    F("address.street", "Street", "text", { group: "Address" }),
    F("address.city", "City", "text", { group: "Address" }),
    F("address.state", "State", "text", { group: "Address" }),
    F("address.zip", "Zip code", "text", { group: "Address" }),
    F("address.country", "Country", "select", { options: COUNTRIES, group: "Address" }),
    F("description", "Description", "textarea", { group: "Description" }),
    F("healthScore", "Health", "number", { derived: true }),
    F("healthBand", "Health band", "select", { options: ["Healthy", "Watch", "At risk"], derived: true }),
    F("lastInteractionAt", "Last interaction", "datetime", { derived: true }),
    F("nextActionDue", "Next action due", "datetime", { derived: true }),
    F("attentionCount", "Attention flags", "number", { derived: true }),
    ...audit,
  ],
  contacts: [
    F("name", "Contact", "text", { derived: true }),
    F("salutation", "Salutation", "select", { options: SALUTATIONS, group: "Contact information" }),
    F("firstName", "First name", "text", { group: "Contact information" }),
    F("lastName", "Last name", "text", { group: "Contact information", required: true }),
    F("accountId", "Account", "ref", { ref: "accounts", group: "Contact information" }),
    F("title", "Title", "text", { group: "Contact information" }),
    F("department", "Department", "text", { group: "Contact information" }),
    F("email", "Email", "email", { group: "Contact information" }),
    F("secondaryEmail", "Secondary email", "email", { group: "Contact information" }),
    F("phone", "Phone", "phone", { group: "Contact information" }),
    F("mobile", "Mobile", "phone", { group: "Contact information" }),
    F("otherPhone", "Other phone", "phone", { group: "More" }),
    F("homePhone", "Home phone", "phone", { group: "More" }),
    F("leadSource", "Lead source", "select", { options: LEAD_SOURCES, group: "Contact information" }),
    F("ownerId", "Owner", "user", { group: "Contact information" }),
    F("reportingToId", "Reports to", "ref", { ref: "contacts", group: "More" }),
    F("assistant", "Assistant", "text", { group: "More" }),
    F("asstPhone", "Assistant phone", "phone", { group: "More" }),
    F("dateOfBirth", "Date of birth", "date", { group: "More" }),
    F("skypeId", "Skype ID", "text", { group: "More" }),
    F("twitter", "Twitter", "text", { group: "More" }),
    F("fax", "Fax", "text", { group: "More" }),
    F("emailOptOut", "Email opt-out", "boolean", { group: "More" }),
    F("mailing.street", "Mailing street", "text", { group: "Mailing address" }),
    F("mailing.city", "Mailing city", "text", { group: "Mailing address" }),
    F("mailing.state", "Mailing state", "text", { group: "Mailing address" }),
    F("mailing.zip", "Mailing zip", "text", { group: "Mailing address" }),
    F("mailing.country", "Mailing country", "select", { options: COUNTRIES, group: "Mailing address" }),
    F("description", "Description", "textarea", { group: "Description" }),
    F("lastInteractionAt", "Last interaction", "datetime", { derived: true }),
    F("nextActionDue", "Next action due", "datetime", { derived: true }),
    F("openDeals", "Open deals", "number", { derived: true }),
    ...audit,
  ],
  accounts: [
    F("name", "Account", "text", { group: "Account information", required: true }),
    F("accountType", "Type", "select", { options: ACCOUNT_TYPES, group: "Account information" }),
    F("industry", "Industry", "select", { options: INDUSTRIES, group: "Account information" }),
    F("rating", "Rating", "select", { options: RATINGS, group: "Account information" }),
    F("phone", "Phone", "phone", { group: "Account information" }),
    F("website", "Website", "url", { group: "Account information" }),
    F("ownerId", "Owner", "user", { group: "Account information" }),
    F("parentAccountId", "Parent account", "ref", { ref: "accounts", group: "Account information" }),
    F("employees", "Employees", "text", { group: "Company details" }),
    F("annualRevenue", "Annual revenue", "money", { group: "Company details" }),
    F("ownership", "Ownership", "text", { group: "Company details" }),
    F("tickerSymbol", "Ticker symbol", "text", { group: "Company details" }),
    F("sicCode", "SIC code", "text", { group: "Company details" }),
    F("accountSite", "Account site", "text", { group: "Company details" }),
    F("fax", "Fax", "text", { group: "Company details" }),
    F("billing.street", "Billing street", "text", { group: "Billing address" }),
    F("billing.city", "Billing city", "text", { group: "Billing address" }),
    F("billing.state", "Billing state", "text", { group: "Billing address" }),
    F("billing.zip", "Billing zip", "text", { group: "Billing address" }),
    F("billing.country", "Billing country", "select", { options: COUNTRIES, group: "Billing address" }),
    F("shipping.street", "Shipping street", "text", { group: "Shipping address" }),
    F("shipping.city", "Shipping city", "text", { group: "Shipping address" }),
    F("shipping.state", "Shipping state", "text", { group: "Shipping address" }),
    F("shipping.zip", "Shipping zip", "text", { group: "Shipping address" }),
    F("shipping.country", "Shipping country", "select", { options: COUNTRIES, group: "Shipping address" }),
    F("description", "Description", "textarea", { group: "Description" }),
    F("primaryContactName", "Primary contact", "text", { derived: true }),
    F("openDeals", "Open deals", "number", { derived: true }),
    F("openDealValue", "Open deal value", "money", { derived: true }),
    F("lastInteractionAt", "Last activity", "datetime", { derived: true }),
    ...audit,
  ],
  deals: [
    F("name", "Deal", "text", { group: "Deal information", required: true }),
    F("refId", "Deal ID", "text", { group: "System" }),
    F("accountId", "Account", "ref", { ref: "accounts", group: "Deal information" }),
    F("contactId", "Contact", "ref", { ref: "contacts", group: "Deal information" }),
    F("stage", "Stage", "select", { options: DEAL_STAGES, group: "Deal information", required: true }),
    F("amount", "Amount", "money", { group: "Deal information", required: true }),
    F("probability", "Probability", "percent", { group: "Deal information" }),
    F("expectedRevenue", "Expected revenue", "money", { derived: true }),
    F("closingDate", "Closing date", "date", { group: "Deal information", required: true }),
    F("type", "Type", "select", { options: DEAL_TYPES, group: "Deal information" }),
    F("leadSource", "Lead source", "select", { options: LEAD_SOURCES, group: "Deal information" }),
    F("nextStep", "Next step", "text", { group: "Deal information" }),
    F("ownerId", "Owner", "user", { group: "Deal information" }),
    F("description", "Description", "textarea", { group: "Description" }),
    F("stageAgeDays", "Days in stage", "number", { derived: true }),
    F("lastInteractionAt", "Last activity", "datetime", { derived: true }),
    F("nextActionDue", "Next action due", "datetime", { derived: true }),
    F("attentionCount", "Attention flags", "number", { derived: true }),
    ...audit,
  ],
  tasks: [
    F("subject", "Title", "text", { required: true }),
    F("type", "Type", "select", { options: TASK_TYPES }),
    F("dueDate", "Due date", "date"),
    F("priority", "Priority", "select", { options: PRIORITIES }),
    F("status", "Status", "select", { options: TASK_STATUSES }),
    F("assigneeId", "Assigned to", "user"),
    F("ownerId", "Owner", "user"),
    F("relatedLabel", "Related to", "text", { derived: true }),
    F("contactName", "Contact", "text", { derived: true }),
    F("description", "Description", "textarea"),
    F("completedAt", "Completed", "datetime"),
    ...audit,
  ],
  calls: [
    F("subject", "Subject", "text", { required: true }),
    F("direction", "Direction", "select", { options: CALL_DIRECTIONS }),
    F("status", "Status", "select", { options: CALL_STATUSES }),
    F("scheduledAt", "Call time", "datetime"),
    F("durationMin", "Duration (min)", "number"),
    F("outcome", "Outcome", "select", { options: CALL_OUTCOMES }),
    F("phone", "Phone", "phone"),
    F("contactName", "Contact", "text", { derived: true }),
    F("relatedLabel", "Related to", "text", { derived: true }),
    F("ownerId", "Owner", "user"),
    F("description", "Notes", "textarea"),
    ...audit,
  ],
  meetings: [
    F("title", "Title", "text", { required: true }),
    F("startAt", "Starts", "datetime"),
    F("endAt", "Ends", "datetime"),
    F("status", "Status", "select", { options: MEETING_STATUSES }),
    F("location", "Location", "text"),
    F("participantNames", "Participants", "text", { derived: true }),
    F("relatedLabel", "Related to", "text", { derived: true }),
    F("ownerId", "Owner", "user"),
    F("description", "Agenda", "textarea"),
    F("outcome", "Outcome", "textarea"),
    ...audit,
  ],
};

export function fieldDef(module: ModuleKey, key: string) {
  return FIELDS[module].find((f) => f.key === key);
}

/** Read a possibly-dotted path ("billing.city"). */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
