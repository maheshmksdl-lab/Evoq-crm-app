import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { login, trackErrors } from "./helpers";

const OUT = path.join(process.cwd(), "docs", "screenshots");
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
] as const;

/** One entry per major screen. `ready` waits for real content, so a screenshot is never of a skeleton. */
const SCREENS: { name: string; url: string; ready: (p: Page) => Promise<void> }[] = [
  { name: "01-dashboard", url: "/", ready: async (p) => { await expect(p.getByRole("heading", { name: "Needs attention", exact: true })).toBeVisible(); await expect(p.getByRole("link", { name: /Pipeline value/ })).toBeVisible(); } },
  { name: "02-leads-list", url: "/leads?scope=all", ready: async (p) => { await expect(p.getByRole("link", { name: "James Wilson", exact: true })).toBeVisible(); } },
  { name: "03-leads-kanban", url: "/leads?scope=all&view=kanban", ready: async (p) => { await expect(p.getByRole("heading", { name: "Qualified", exact: true })).toBeVisible(); } },
  { name: "04-lead-detail", url: "/leads/3", ready: async (p) => { await expect(p.getByRole("heading", { name: "Lead health", exact: true })).toBeVisible(); } },
  { name: "05-contacts-list", url: "/contacts?scope=all", ready: async (p) => { await expect(p.getByRole("link", { name: "John Smith", exact: true })).toBeVisible(); } },
  { name: "06-contact-detail", url: "/contacts/4", ready: async (p) => { await expect(p.getByRole("heading", { level: 1, name: "John Smith" })).toBeVisible(); } },
  { name: "07-accounts-list", url: "/accounts?scope=all", ready: async (p) => { await expect(p.getByRole("link", { name: "Sweany Inc", exact: true })).toBeVisible(); } },
  { name: "08-account-detail", url: "/accounts/2", ready: async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Sweany Inc" })).toBeVisible(); } },
  { name: "09-deals-list", url: "/deals?scope=all", ready: async (p) => { await expect(p.getByRole("link", { name: "Deal SDL 11", exact: true })).toBeVisible(); } },
  { name: "10-deals-pipeline", url: "/deals?scope=all&view=kanban", ready: async (p) => { await expect(p.getByRole("heading", { name: "Needs Analysis", exact: true })).toBeVisible(); } },
  { name: "11-deal-detail", url: "/deals/2", ready: async (p) => { await expect(p.getByRole("heading", { name: "Commercials", exact: true })).toBeVisible(); } },
  { name: "12-tasks", url: "/tasks?scope=all", ready: async (p) => { await expect(p.getByRole("link", { name: "Schedule Demo", exact: true })).toBeVisible(); } },
  { name: "13-calls", url: "/calls?scope=all", ready: async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Calls" })).toBeVisible(); await expect(p.getByText(/No calls yet|Showing/)).toBeVisible(); } },
  { name: "14-meetings", url: "/meetings?scope=all", ready: async (p) => { await expect(p.getByRole("heading", { level: 1, name: "Meetings" })).toBeVisible(); await expect(p.getByText(/No meetings yet|Showing/)).toBeVisible(); } },
  { name: "15-reports", url: "/reports", ready: async (p) => { await expect(p.getByRole("link", { name: "Deal 30", exact: true })).toBeVisible(); } },
  { name: "16-report-viewer", url: "/reports/r2", ready: async (p) => { await expect(p.getByText(/Definition:/)).toBeVisible(); } },
  { name: "17-report-builder", url: "/reports/new?template=1", ready: async (p) => { await expect(p.getByText(/Definition:/)).toBeVisible(); } },
  { name: "18-settings-users", url: "/settings?tab=users", ready: async (p) => { await expect(p.getByRole("table", { name: "Users" })).toBeVisible(); } },
  { name: "19-settings-permissions", url: "/settings?tab=permissions", ready: async (p) => { await expect(p.getByRole("table")).toBeVisible(); } },
  { name: "20-settings-modules", url: "/settings?tab=modules", ready: async (p) => { await expect(p.getByText("Hidden from navigation").or(p.getByText(/custom$/).first())).toBeVisible(); } },
  { name: "21-dashboard-builder", url: "/home/hp1/edit", ready: async (p) => { await expect(p.getByText("Add a widget")).toBeVisible(); } },
];

test.describe("screens render, are responsive and pass automated accessibility checks", () => {
  test.beforeAll(() => { fs.mkdirSync(OUT, { recursive: true }); });

  for (const vp of VIEWPORTS) {
    test(`screenshots at ${vp.name} (${vp.width}px) without errors or horizontal scroll`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await login(page);
      const errors = trackErrors(page);
      for (const s of SCREENS) {
        await page.goto(s.url);
        await s.ready(page);
        await page.waitForTimeout(400); // charts finish animating
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect.soft(overflow, `${s.name} @${vp.name} scrolls horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
        await page.screenshot({ path: path.join(OUT, `${vp.name}-${s.name}.png`), fullPage: vp.name === "desktop", animations: "disabled" });
      }
      expect(errors).toEqual([]);
    });
  }

  test("axe: no critical or serious violations on any screen (desktop)", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page);
    const failures: string[] = [];
    for (const s of SCREENS) {
      await page.goto(s.url);
      await s.ready(page);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      for (const v of r.violations.filter((x) => x.impact === "critical" || x.impact === "serious")) {
        failures.push(`${s.name}: ${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.nodes[0]?.target.join(" ")}`);
      }
    }
    expect(failures).toEqual([]);
  });
});
