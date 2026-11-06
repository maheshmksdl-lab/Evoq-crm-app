import { describe, expect, it } from "vitest";
import { getDb } from "@/lib/services/local/store";
import { intelligenceFor, leadHealth } from "@/lib/domain/intelligence";
import { activitiesFor } from "@/lib/domain/activity";
import { can, teamUserIds, tierOf } from "@/lib/domain/permissions";
import { METRIC_BY_KEY } from "@/lib/domain/metrics";
import { parseCsv, toCsv } from "@/lib/domain/csv";
import { Db } from "@/lib/schemas";
import { buildSeed } from "@/lib/services/local/seed";

const ref = (id: string) => ({ module: "leads" as const, id });

describe("seed", () => {
  it("is valid against the Db schema and cross-references resolve", () => {
    const db = buildSeed();
    expect(Db.safeParse(db).success).toBe(true);
    const acc = new Set(db.accounts.map((a) => a.id));
    db.contacts.forEach((c) => c.accountId && expect(acc.has(c.accountId)).toBe(true));
    db.deals.forEach((d) => d.accountId && expect(acc.has(d.accountId)).toBe(true));
    const con = new Set(db.contacts.map((c) => c.id));
    db.deals.forEach((d) => d.contactId && expect(con.has(d.contactId)).toBe(true));
  });
});

describe("next action precedence", () => {
  it("surfaces the earliest open dated item; overdue wins", () => {
    const i = intelligenceFor(getDb(), { module: "accounts", id: "10" });
    // tasks 3 (due 17 Apr) and 4 (due 16 Apr) are both overdue; the earliest is task 4
    expect(i.nextAction?.title).toBe("Prepare quote sent to email");
    expect(i.nextAction?.overdue).toBe(true);
  });
  it("is null when nothing is planned", () => {
    expect(intelligenceFor(getDb(), ref("2")).nextAction).toBeNull();
  });
});

describe("lead health", () => {
  it("explains a scored lead and the factors sum to the score", () => {
    const db = getDb();
    const lead = db.leads.find((l) => l.id === "2")!;
    const h = leadHealth(lead, activitiesFor(db, ref("2")));
    expect(h.state).toBe("scored");
    expect(h.factors.reduce((s, f) => s + f.points, 0)).toBe(h.score);
    expect(h.factors.length).toBeGreaterThan(4);
  });
  it("reports insufficient data instead of inventing a score", () => {
    const lead = getDb().leads.find((l) => l.id === "8")!;
    const bare = { ...lead, mobile: "", phone: "", email: "", rating: "" as const };
    const h = leadHealth(bare, []);
    expect(h.state).toBe("insufficient");
    expect(h.score).toBeNull();
  });
  it("does not track Lost/Unqualified leads", () => {
    expect(leadHealth(getDb().leads.find((l) => l.id === "7")!, []).state).toBe("closed");
  });
});

describe("attention", () => {
  it("flags stale and no-next-action with a reason and corrective action", () => {
    const i = intelligenceFor(getDb(), ref("3"));
    const codes = i.attention.map((a) => a.code);
    expect(codes).toContain("no_next_action");
    expect(codes).toContain("no_recent_activity");
    i.attention.forEach((a) => {
      expect(a.action.length).toBeGreaterThan(0);
      expect(a.reason.length).toBeGreaterThan(0);
    });
  });
  it("skips closed leads", () => {
    expect(intelligenceFor(getDb(), ref("7")).attention).toEqual([]);
  });
});

describe("permissions", () => {
  it("Super Admin is always allowed; the matrix is honoured for others", () => {
    const db = structuredClone(getDb());
    const admin = db.users.find((u) => u.role === "Administrator")!;
    expect(can(db, admin, "Leads", "delete")).toBe(true);
    db.settings.permissions["Leads"]["Administrator"] = { fullAccess: false, delete: false, read: true };
    expect(can(db, admin, "Leads", "delete")).toBe(false);
    expect(can(db, db.users.find((u) => u.role === "Super Admin")!, "Leads", "delete")).toBe(true);
  });
  it("team scope follows the role tree", () => {
    const db = getDb();
    const vp = db.users.find((u) => u.role === "VP of Operations")!;
    const ids = teamUserIds(db, vp);
    expect(ids).toContain(vp.id);
    expect(ids).toContain(db.users.find((u) => u.role === "Support Executive")!.id);
    expect(ids).not.toContain(db.users.find((u) => u.role === "Administrator")!.id);
    expect(tierOf("Support Executive")).toBe("rep");
  });
});

describe("metrics", () => {
  it("pipeline value equals the sum of open deal amounts", () => {
    const db = getDb();
    const expected = db.deals.filter((d) => d.stage !== "Closed Won").reduce((s, d) => s + d.amount, 0);
    expect(METRIC_BY_KEY.pipeline_value.compute(db, null).value).toBe(expected);
  });
  it("scope limits results", () => {
    expect(METRIC_BY_KEY.open_deals.compute(getDb(), ["nobody"]).value).toBe(0);
  });
});

describe("csv", () => {
  it("round-trips quotes, commas and newlines", () => {
    const rows = [["a,b", 'he said "hi"', "line1\nline2"], ["1", "2", "3"]];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
  it("neutralises formula injection", () => {
    expect(toCsv([["=SUM(A1)"]])).toContain("'=SUM(A1)");
  });
});
