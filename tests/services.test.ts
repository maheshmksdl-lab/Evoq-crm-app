import { describe, expect, it } from "vitest";
import * as svc from "@/lib/services";
import { getDb } from "@/lib/services/local/store";
import { LeadInput } from "@/lib/schemas/inputs";

describe("lead updates", () => {
  it("a partial update does not blank other fields", async () => {
    const before = getDb().leads.find((l) => l.id === "2")!;
    await svc.leads.update("2", { status: "Qualified" });
    const after = getDb().leads.find((l) => l.id === "2")!;
    expect(after.status).toBe("Qualified");
    expect(after.email).toBe(before.email);
    expect(after.mobile).toBe(before.mobile);
    expect(after.company).toBe(before.company);
  });
  it("writes history for status changes", async () => {
    await svc.leads.update("2", { status: "Qualified" });
    expect(getDb().audit.some((a) => a.related.id === "2" && a.action === "status_changed")).toBe(true);
  });
  it("rejects an invalid email with a useful message", async () => {
    await expect(svc.leads.update("2", { email: "not-an-email" })).rejects.toThrow(/email/i);
  });
  it("requires a last name on create", () => {
    expect(LeadInput.safeParse({ lastName: "", status: "New", ownerId: "1" }).success).toBe(false);
  });
});

describe("lead conversion", () => {
  const input = (over: object = {}) => ({
    account: { mode: "new", name: "Carter Traders" },
    contact: { firstName: "John", lastName: "Carter" },
    deal: { create: true, name: "Carter deal", amount: 5000, closingDate: "2026-12-31", stage: "Qualification" },
    ownerId: "1",
    notifyOwner: false,
    ...over,
  });
  it("creates account, contact and deal and marks the lead converted", async () => {
    const counts = { a: getDb().accounts.length, c: getDb().contacts.length, d: getDb().deals.length };
    const r = await svc.leads.convert("3", input());
    const db = getDb();
    expect(db.accounts.length).toBe(counts.a + 1);
    expect(db.contacts.length).toBe(counts.c + 1);
    expect(db.deals.length).toBe(counts.d + 1);
    expect(db.leads.find((l) => l.id === "3")!.converted?.dealId).toBe(r.dealId);
    expect(db.deals.find((d) => d.id === r.dealId)!.fromLeadId).toBe("3");
  });
  it("cannot convert twice and the lead becomes read-only", async () => {
    await svc.leads.convert("3", input());
    await expect(svc.leads.convert("3", input())).rejects.toThrow(/already converted/i);
    await expect(svc.leads.update("3", { title: "x" })).rejects.toThrow(/converted/i);
  });
  it("keeps the existing rule: a deal needs a name and a closing date", async () => {
    await expect(svc.leads.convert("3", input({ deal: { create: true, name: "", amount: 1, closingDate: "2026-12-31", stage: "Qualification" } }))).rejects.toThrow(/deal name/i);
    await expect(svc.leads.convert("3", input({ deal: { create: true, name: "x", amount: 1, closingDate: "", stage: "Qualification" } }))).rejects.toThrow();
  });
  it("moves open follow-ups to the new deal so they continue", async () => {
    await svc.activities.createTask({ subject: "Call back", type: "Task", dueDate: "2026-11-10", status: "To-Do", ownerId: "1", related: { module: "leads", id: "3" } });
    const r = await svc.leads.convert("3", input());
    const t = getDb().tasks.find((x) => x.subject === "Call back")!;
    expect(t.related).toEqual({ module: "deals", id: r.dealId });
  });
  it("can link an existing account instead of creating one", async () => {
    const n = getDb().accounts.length;
    await svc.leads.convert("3", input({ account: { mode: "existing", accountId: "10" }, deal: { create: false } }));
    expect(getDb().accounts.length).toBe(n);
    expect(getDb().contacts.at(-1)!.accountId).toBe("10");
  });
});

describe("deals", () => {
  it("a stage change updates probability and history", async () => {
    await svc.deals.setStage("3", "Needs Analysis");
    const d = getDb().deals.find((x) => x.id === "3")!;
    expect(d.probability).toBe(20);
    expect(d.stageHistory.at(-1)).toMatchObject({ from: "Qualification", to: "Needs Analysis" });
  });
  it("rejects negative amounts", async () => {
    await expect(svc.deals.update("3", { amount: -5 })).rejects.toThrow();
  });
});

describe("activities", () => {
  it("completing a task clears the next action and becomes an interaction", async () => {
    const t = await svc.activities.createTask({ subject: "x", type: "Task", dueDate: "2026-11-10", status: "To-Do", ownerId: "1", related: { module: "leads", id: "2" } });
    expect((await svc.intelligence({ module: "leads", id: "2" })).nextAction?.title).toBe("x");
    await svc.activities.completeTask(t.id);
    expect(getDb().tasks.find((x) => x.id === t.id)!.completedAt).not.toBeNull();
    const i = await svc.intelligence({ module: "leads", id: "2" });
    expect(i.nextAction).toBeNull();
    expect(i.lastInteraction?.title).toBe("x");
  });
  it("a completed call needs an outcome; a meeting must end after it starts", async () => {
    await expect(svc.activities.createCall({ subject: "c", direction: "Outbound", status: "Completed", scheduledAt: "2026-11-05T10:00:00Z", ownerId: "1", related: { module: "leads", id: "2" } })).rejects.toThrow(/outcome/i);
    await expect(svc.activities.createMeeting({ title: "m", startAt: "2026-11-07T10:00:00Z", endAt: "2026-11-07T09:00:00Z", status: "Scheduled", ownerId: "1", related: null })).rejects.toThrow(/after the start/i);
  });
  it("an account stream aggregates deal activity exactly once", async () => {
    await svc.activities.addNote({ related: { module: "deals", id: "11" }, body: "deal note" });
    const tl = await svc.timeline({ module: "accounts", id: "6" });
    const notes = [...tl.history, ...tl.upcoming].filter((i) => i.kind === "note");
    expect(notes).toHaveLength(1);
    expect(notes[0].via).toEqual({ module: "deals", id: "11" });
  });
  it("refuses logged email on a converted lead", async () => {
    await svc.leads.convert("3", { account: { mode: "new", name: "Z" }, contact: { firstName: "a", lastName: "b" }, deal: { create: false }, ownerId: "1", notifyOwner: false });
    await expect(svc.activities.logEmail({ related: { module: "leads", id: "3" }, direction: "Sent", to: "a@b.co", subject: "s", body: "", at: new Date().toISOString() })).rejects.toThrow(/converted/i);
  });
});

describe("deleting", () => {
  it("unlinks (never deletes) tasks and clears references", async () => {
    await svc.removeRecord("accounts", "10");
    const db = getDb();
    expect(db.accounts.some((a) => a.id === "10")).toBe(false);
    expect(db.tasks.find((t) => t.id === "3")!.related).toBeNull();
    expect(db.contacts.find((c) => c.id === "10")!.accountId).toBeNull();
    expect(db.deals.find((d) => d.id === "6")!.accountId).toBeNull();
  });
});

describe("authorization is enforced in the service layer", () => {
  it("blocks writes that the role's permission matrix denies", async () => {
    const db = getDb();
    await svc.settings.savePermissions({ ...db.settings.permissions, Leads: { ...db.settings.permissions.Leads, "Support Executive": { read: true } } });
    await svc.session.switchUser("5");
    await expect(svc.leads.update("2", { title: "x" })).rejects.toThrow(/permission/i);
    await expect(svc.list("leads")).resolves.toBeTruthy();
  });
  it("only a Super Admin can switch users", async () => {
    await svc.session.switchUser("5");
    await expect(svc.session.switchUser("1")).rejects.toThrow(/permission/i);
  });
});

describe("EVI agents", () => {
  it("proposals do nothing until approved", async () => {
    const before = getDb().tasks.length;
    const props = await svc.evi.propose({ module: "leads", id: "3" });
    expect(props.length).toBeGreaterThan(0);
    expect(getDb().tasks.length).toBe(before);
    const task = props.find((p) => p.kind === "create_task")!;
    await expect(svc.evi.execute(task.id)).rejects.toThrow(/approved/i);
    await svc.evi.decide(task.id, "approve");
    const done = await svc.evi.execute(task.id);
    expect(done.status).toBe("succeeded");
    expect(getDb().tasks.length).toBe(before + 1);
    expect(done.history[0].event).toBe("Proposed");
  });
  it("rejected proposals cannot run and proposals are not duplicated", async () => {
    const a = await svc.evi.propose({ module: "leads", id: "3" });
    const b = await svc.evi.propose({ module: "leads", id: "3" });
    expect(b.length).toBe(a.length);
    await svc.evi.decide(a[0].id, "reject");
    await expect(svc.evi.execute(a[0].id)).rejects.toThrow();
  });
});

describe("import", () => {
  it("imports valid rows and reports row errors", async () => {
    const n = getDb().leads.length;
    const r = await svc.dataAdmin.import("leads", [
      { firstName: "Ada", lastName: "Lovelace", email: "ada@x.io", status: "new" },
      { firstName: "Bad", lastName: "", email: "x" },
    ]);
    expect(r.created).toBe(1);
    expect(r.failed).toHaveLength(1);
    expect(getDb().leads.length).toBe(n + 1);
    expect(getDb().leads.at(-1)!.status).toBe("New");
  });
});
