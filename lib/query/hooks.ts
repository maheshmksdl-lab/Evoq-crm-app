"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ModuleKey, RecordModule, RecordRef } from "@/lib/schemas";
import * as svc from "@/lib/services";
import type { ListParams } from "@/lib/services";
import { qk } from "./keys";

/* ───────── reads ───────── */
export const useSession = () => useQuery({ queryKey: qk.session(), queryFn: () => svc.session.current(), staleTime: 0 });

export const useList = <M extends ModuleKey>(m: M, p: ListParams) =>
  useQuery({ queryKey: qk.list(m, p), queryFn: () => svc.list(m, p), placeholderData: keepPreviousData });
export const useListAll = <M extends ModuleKey>(m: M, p?: Omit<ListParams, "page" | "pageSize">) =>
  useQuery({ queryKey: qk.listAll(m, p), queryFn: () => svc.listAll(m, p) });
export const useRecord = <M extends ModuleKey>(m: M, id: string) =>
  useQuery({ queryKey: qk.detail(m, id), queryFn: () => svc.get(m, id), enabled: id !== "" });
export const useTimeline = (r: RecordRef) => useQuery({ queryKey: qk.timeline(r), queryFn: () => svc.timeline(r) });
export const useIntel = (r: RecordRef) => useQuery({ queryKey: qk.intel(r), queryFn: () => svc.intelligence(r) });
export const useRelated = (r: RecordRef) => useQuery({ queryKey: qk.related(r), queryFn: () => svc.related(r) });
export const useSearch = (q: string) => useQuery({ queryKey: qk.search(q), queryFn: () => svc.search(q), enabled: q.trim().length >= 2 });
export const useMetrics = (keys: string[], scope: string[] | null) =>
  useQuery({ queryKey: qk.metrics(keys, scope), queryFn: () => svc.metrics(keys, scope) });
export const useWork = (scope: string[] | null) => useQuery({ queryKey: qk.work(scope), queryFn: () => svc.workQueue(scope) });
export const useAttention = (scope: string[] | null) => useQuery({ queryKey: qk.attention(scope), queryFn: () => svc.attentionQueue(scope) });
export const useRecent = (scope: string[] | null) => useQuery({ queryKey: qk.recent(scope), queryFn: () => svc.recentActivity(scope) });
export const useTeam = (enabled = true) => useQuery({ queryKey: qk.team(), queryFn: () => svc.teamOverview(), enabled });
export const useViews = (m: ModuleKey) => useQuery({ queryKey: qk.views(m), queryFn: () => svc.views.list(m) });
export const useReports = () => useQuery({ queryKey: qk.reports(), queryFn: () => svc.reports.list() });
export const useReport = (id: string) => useQuery({ queryKey: qk.report(id), queryFn: () => svc.reports.get(id), enabled: id !== "" });
export const useDashboards = () => useQuery({ queryKey: qk.dashboards(), queryFn: () => svc.dashboards.list() });
export const useSettings = () => useQuery({ queryKey: qk.settings(), queryFn: () => svc.settings.get() });
export const useUsers = () => useQuery({ queryKey: qk.users(), queryFn: () => svc.users.list() });
export const useRoles = () => useQuery({ queryKey: qk.roles(), queryFn: () => svc.roles.list() });
export const useAgentActions = (r?: RecordRef) => useQuery({ queryKey: qk.agent(r), queryFn: () => svc.evi.list(r) });

/* ───────── writes ─────────
 * The store notifies on every commit and QueryProvider invalidates ["crm"], so mutations
 * do not hand-pick keys (that is how caches drift). `ok` is the success toast. */
function useAction<A extends unknown[], R>(fn: (...a: A) => Promise<R>, ok?: string | ((r: R) => string)) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: A) => fn(...a),
    onSuccess: (r) => {
      if (ok) toast.success(typeof ok === "function" ? ok(r) : ok);
      qc.invalidateQueries({ queryKey: ["crm"] });
    },
  });
}
/** mutate with positional args: `m.mutate([id, patch])` */
export const useCreateRecord = (m: RecordModule) =>
  useAction((input: unknown) => (svc[m === "leads" ? "leads" : m === "contacts" ? "contacts" : m === "accounts" ? "accounts" : "deals"].create as (i: unknown) => Promise<{ id: string }>)(input), "Created");
export const useUpdateRecord = (m: RecordModule) =>
  useAction((id: string, patch: unknown) => (svc[m].update as (id: string, p: unknown) => Promise<unknown>)(id, patch), "Saved");
export const useRemoveRecord = () => useAction((m: RecordModule, id: string) => svc.removeRecord(m, id), "Deleted");
export const useBulkRemove = () => useAction((m: ModuleKey, ids: string[]) => svc.bulkRemove(m, ids), (n) => `Deleted ${n} record${n === 1 ? "" : "s"}`);
export const useBulkAssign = () => useAction((m: RecordModule | "tasks", ids: string[], owner: string | null) => svc.bulkAssign(m, ids, owner), (n) => `Reassigned ${n} record${n === 1 ? "" : "s"}`);
export const useConvertLead = () => useAction((id: string, input: unknown) => svc.leads.convert(id, input), "Lead converted");
export const useSetStage = () => useAction((id: string, stage: Parameters<typeof svc.deals.setStage>[1]) => svc.deals.setStage(id, stage), (d) => `Moved to ${(d as { stage: string }).stage}`);
export const useSetLeadStatus = () => useAction((id: string, s: Parameters<typeof svc.leads.setStatus>[1]) => svc.leads.setStatus(id, s), (l) => `Status: ${(l as { status: string }).status}`);
export const useOverrideHealth = () => useAction((id: string, i: unknown) => svc.leads.overrideHealth(id, i), "Health override saved");
export const useClearHealthOverride = () => useAction((id: string) => svc.leads.clearHealthOverride(id), "Back to calculated health");

export const useActivityActions = () => ({
  createTask: useAction((i: unknown) => svc.activities.createTask(i), "Task created"),
  updateTask: useAction((id: string, p: unknown) => svc.activities.updateTask(id, p), "Task saved"),
  completeTask: useAction((id: string, done?: boolean) => svc.activities.completeTask(id, done), (t) => ((t as { status: string }).status === "Completed" ? "Task completed" : "Task reopened")),
  createCall: useAction((i: unknown) => svc.activities.createCall(i), "Call logged"),
  updateCall: useAction((id: string, p: unknown) => svc.activities.updateCall(id, p), "Call saved"),
  createMeeting: useAction((i: unknown) => svc.activities.createMeeting(i), "Meeting saved"),
  updateMeeting: useAction((id: string, p: unknown) => svc.activities.updateMeeting(id, p), "Meeting saved"),
  remove: useAction((m: "tasks" | "calls" | "meetings", id: string) => svc.activities.remove(m, id), "Deleted"),
  addNote: useAction((i: unknown) => svc.activities.addNote(i), "Note added"),
  updateNote: useAction((id: string, body: string) => svc.activities.updateNote(id, body), "Note saved"),
  removeNote: useAction((id: string) => svc.activities.removeNote(id), "Note deleted"),
  addComment: useAction((i: unknown) => svc.activities.addComment(i), "Comment added"),
  removeComment: useAction((id: string) => svc.activities.removeComment(id), "Comment deleted"),
  addAttachment: useAction((r: RecordRef, f: Parameters<typeof svc.activities.addAttachment>[1]) => svc.activities.addAttachment(r, f), "File attached"),
  removeAttachment: useAction((id: string) => svc.activities.removeAttachment(id), "Attachment removed"),
  logEmail: useAction((i: unknown) => svc.activities.logEmail(i), "Email logged"),
});

export const useAdmin = () => ({
  saveView: useAction((i: unknown, id?: string) => svc.views.save(i, id), "View saved"),
  removeView: useAction((id: string) => svc.views.remove(id), "View deleted"),
  saveReport: useAction((i: unknown, id?: string) => svc.reports.save(i, id), "Report saved"),
  removeReport: useAction((id: string) => svc.reports.remove(id), "Report deleted"),
  togglePin: useAction((id: string) => svc.reports.togglePin(id)),
  saveDashboard: useAction((i: unknown, id?: string) => svc.dashboards.save(i, id), "Dashboard saved"),
  removeDashboard: useAction((id: string) => svc.dashboards.remove(id), "Dashboard deleted"),
  setActiveDashboard: useAction((id: string) => svc.settings.setActiveDashboard(id)),
  updateOrg: useAction((i: unknown) => svc.settings.updateOrg(i), "Organization saved"),
  updateModules: useAction((i: unknown) => svc.settings.updateModules(i), "Modules saved"),
  updateEmail: useAction((i: unknown) => svc.settings.updateEmail(i), "Email settings saved"),
  savePermissions: useAction((i: unknown) => svc.settings.savePermissions(i), "Permissions saved"),
  addField: useAction((i: unknown) => svc.settings.addCustomField(i), "Field added"),
  removeField: useAction((id: string) => svc.settings.removeCustomField(id), "Field removed"),
  saveLayout: useAction((i: unknown) => svc.settings.saveLayout(i), "Layout saved"),
  resetLayout: useAction((m: RecordModule) => svc.settings.resetLayout(m), "Layout reset"),
  createUser: useAction((i: unknown) => svc.users.create(i), "User created"),
  updateUser: useAction((id: string, p: unknown) => svc.users.update(id, p), "User saved"),
  createRole: useAction((i: unknown) => svc.roles.create(i), "Role created"),
  updateRole: useAction((id: string, p: unknown) => svc.roles.update(id, p), "Role saved"),
  removeRole: useAction((id: string) => svc.roles.remove(id), "Role deleted"),
  importRows: useAction((m: svc.ImportModule, rows: Record<string, string>[]) => svc.dataAdmin.import(m, rows)),
  restore: useAction((json: string) => svc.dataAdmin.restore(json), "Backup restored"),
  resetSample: useAction(() => svc.dataAdmin.resetSample(), "Sample data restored"),
  updateProfile: useAction((i: unknown) => svc.session.updateProfile(i), "Profile saved"),
  switchUser: useAction((id: string) => svc.session.switchUser(id), (u) => `Now viewing as ${(u as { name: string }).name}`),
});

export const useEvi = () => ({
  propose: useAction((r: RecordRef) => svc.evi.propose(r)),
  decide: useAction((id: string, d: "approve" | "reject") => svc.evi.decide(id, d), (a) => ((a as { status: string }).status === "approved" ? "Approved — run it when ready" : "Rejected")),
  execute: useAction((id: string) => svc.evi.execute(id), (a) => ((a as { status: string }).status === "succeeded" ? ((a as { result: string }).result ?? "Done") : "Failed — see details")),
});
