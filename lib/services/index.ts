/**
 * Service boundary. UI code imports ONLY from here (via lib/query hooks).
 * To move a domain to the real backend, re-export a fetch-based implementation with the
 * same signatures instead of the local adapter. See docs/ARCHITECTURE.md → "Backend contract".
 */
export * from "./local/api";
export { settings, users, roles, views, reports, dashboards, dataAdmin, runReportOn, importableFields } from "./local/admin";
export type { ReportResult, ImportModule } from "./local/admin";
export { evi } from "./local/evi";
export { PermissionError } from "@/lib/domain/permissions";
export type { EviAnswer } from "./local/evi";
export { subscribe, resetToSeed, getLoadIssue } from "./local/store";
export type { ListParams, ListResult, RowMap, LeadRow, ContactRow, AccountRow, DealRow, TaskRow, CallRow, MeetingRow } from "./local/rows";
