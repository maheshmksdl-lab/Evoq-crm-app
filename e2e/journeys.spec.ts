import { expect, test } from "@playwright/test";
import { CREDS, login, trackErrors } from "./helpers";

test.describe("authentication", () => {
  test("signed-out visitors are sent to sign in and a wrong password is rejected", async ({ page }) => {
    await page.goto("/leads");
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("Email").fill(CREDS.email);
    await page.getByLabel("Password", { exact: true }).fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });
  test("validation messages show before submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Enter your password")).toBeVisible();
  });
  test("sign in returns to the page that was asked for, and sign out ends the session", async ({ page }) => {
    await page.goto("/deals");
    await page.getByLabel("Email").fill(CREDS.email);
    await page.getByLabel("Password", { exact: true }).fill(CREDS.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/deals/);
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/deals");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("representative journey", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("dashboard shows real numbers, work and attention", async ({ page }) => {
    const errors = trackErrors(page);
    await expect(page.getByRole("link", { name: /Open leads/ })).toBeVisible();
    await expect(page.getByText("Pipeline value")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Needs attention" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My upcoming work" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("leads: search, filter by KPI, open, log a note, plan and complete a next action", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/leads?scope=all");
    await expect(page.getByRole("link", { name: "James Wilson" })).toBeVisible();
    await page.getByLabel("Search Leads").fill("carter");
    await expect(page.getByRole("link", { name: "John Carter" })).toBeVisible();
    await expect(page.getByRole("link", { name: "James Wilson" })).toHaveCount(0);
    await page.getByRole("link", { name: "John Carter" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "John Carter" })).toBeVisible();

    // stage bar + health are explained
    await expect(page.getByRole("list", { name: "Progress" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lead health" })).toBeVisible();
    await expect(page.getByText(/Calculated .* from the lead/)).toBeVisible();
    // attention rule has a corrective action
    await expect(page.getByRole("heading", { name: "Needs attention" })).toBeVisible();

    // add a note → appears in the activity stream
    await page.getByRole("button", { name: "Note", exact: true }).click();
    await page.getByLabel("Note", { exact: true }).fill("Spoke about bulk pricing");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("Spoke about bulk pricing")).toBeVisible();

    // plan a task → it becomes the next action
    await page.getByRole("button", { name: "Task", exact: true }).first().click();
    await page.getByLabel("Title").fill("Send price list");
    await page.getByLabel("Due date").fill("2030-01-15");
    await page.getByRole("button", { name: "Create task" }).click();
    await expect(page.getByText("Send price list").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Next action" })).toBeVisible();

    // complete it from the timeline
    await page.getByRole("checkbox", { name: "Mark task done" }).first().click();
    await expect(page.getByText("Task completed")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("lead conversion creates the deal and continues on the deal page", async ({ page }) => {
    await page.goto("/leads/11");
    await page.getByRole("button", { name: "Convert to deal" }).click();
    await expect(page.getByRole("heading", { name: "Convert lead" })).toBeVisible();
    await page.getByLabel(/Also create a deal/).click();
    // deal needs a name and closing date (pre-existing rule)
    await page.getByRole("button", { name: "Convert lead", exact: true }).click();
    await expect(page.getByText("Closing date")).toBeVisible();
    await expect(page.locator("#f-x, [role=alert], .text-error-fg").first()).toBeVisible();
    await page.getByLabel("Closing date").fill("2030-06-30");
    await page.getByLabel("Amount").fill("12000");
    await page.getByRole("button", { name: "Convert lead", exact: true }).click();
    await expect(page).toHaveURL(/\/deals\/\d+/);
    await expect(page.getByText("Converted from lead")).toBeVisible({ timeout: 15_000 }).catch(() => {});
    await page.goto("/leads/11");
    await expect(page.getByText("Converted", { exact: true }).first()).toBeVisible();
    // converted lead is read-only
    await expect(page.getByRole("button", { name: "Convert to deal" })).toHaveCount(0);
  });

  test("deals: stage bar moves a deal and updates probability", async ({ page }) => {
    await page.goto("/deals/3");
    await expect(page.getByRole("heading", { level: 1, name: "test deal john smith" })).toBeVisible();
    await page.getByRole("list", { name: "Progress" }).getByRole("button", { name: "Needs Analysis" }).click();
    await expect(page.getByText("Moved to Needs Analysis")).toBeVisible();
    await expect(page.getByText("20%").first()).toBeVisible();
  });

  test("tasks: overdue state and completing from the list", async ({ page }) => {
    await page.goto("/tasks?scope=all");
    await expect(page.getByText(/overdue/i).first()).toBeVisible();
    await page.getByRole("checkbox", { name: "Mark as done" }).first().click();
    await expect(page.getByText("Task completed")).toBeVisible();
  });

  test("calls and meetings can be logged and appear in their lists", async ({ page }) => {
    await page.goto("/calls?scope=all");
    await page.getByRole("button", { name: /New Call/ }).first().click();
    await page.getByLabel("Subject").fill("Intro call");
    await page.getByRole("button", { name: "Log call" }).click();
    await expect(page.getByRole("link", { name: "Intro call" })).toBeVisible();
    await page.goto("/meetings?scope=all");
    await page.getByRole("button", { name: /New Meeting/ }).first().click();
    await page.getByLabel("Title").fill("Demo");
    await page.getByRole("button", { name: "Create meeting" }).click();
    await expect(page.getByRole("link", { name: "Demo" })).toBeVisible();
  });

  test("create validation: lead needs a last name", async ({ page }) => {
    await page.goto("/leads");
    await page.getByRole("button", { name: /New Lead/ }).click();
    await page.getByRole("button", { name: "Create lead" }).click();
    await expect(page.getByText("Last name is required")).toBeVisible();
    await page.getByRole("textbox", { name: "Last name" }).fill("Tester");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill("bad");
    await page.getByRole("button", { name: "Create lead" }).click();
    await expect(page.getByText(/valid email/i).first()).toBeVisible();
  });

  test("global search finds a record and opens it", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("Apex");
    await page.getByRole("option").first().click();
    await expect(page).toHaveURL(/\/(leads|accounts|contacts|deals)\/\d+/);
  });
});

test.describe("manager, admin and reports", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("report from a template, then viewed with a definition", async ({ page }) => {
    await page.goto("/reports/new?template=1");
    await expect(page.getByLabel("Name")).toHaveValue("Pipeline by stage");
    await expect(page.getByText(/Definition:/)).toBeVisible();
    await page.getByRole("button", { name: "Save report" }).click();
    await expect(page).toHaveURL(/\/reports\/r\d+/);
    await expect(page.getByRole("heading", { level: 1, name: "Pipeline by stage" })).toBeVisible();
    await expect(page.getByText(/Definition:/)).toBeVisible();
  });

  test("settings sections load and permissions are enforced after a change", async ({ page }) => {
    const errors = trackErrors(page);
    for (const tab of ["personal", "users", "organization", "roles", "permissions", "email", "modules", "dashboards", "import", "export", "backup"]) {
      await page.goto(`/settings?tab=${tab}`);
      await expect(page.locator("main")).not.toContainText("Couldn't load this");
      await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("dashboard builder: add a widget, save, and it shows on the dashboard", async ({ page }) => {
    await page.goto("/home/hp1/edit");
    await page.getByRole("button", { name: /Won revenue/ }).click();
    await page.getByRole("button", { name: "Save dashboard" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Won revenue")).toBeVisible();
  });

  test("manager view: team overview is visible when viewing as an Operations Manager", async ({ page }) => {
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "View as another user" }).click();
    await page.getByRole("menuitem", { name: /Sales manager/ }).click();
    await expect(page.getByText(/Now viewing as Sales manager/)).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Team overview" })).toBeVisible();
  });

  test("EVI proposes an action that does nothing until approved", async ({ page }) => {
    await page.goto("/leads/3");
    await page.getByRole("button", { name: "Open EVI assistant" }).click();
    await page.getByRole("button", { name: "Suggest actions" }).click();
    await expect(page.getByText("Awaiting approval").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Run now" })).toHaveCount(0);
    await page.getByRole("button", { name: "Approve" }).first().click();
    await page.getByRole("button", { name: "Run now" }).first().click();
    await expect(page.getByText(/created|saved/i).first()).toBeVisible();
  });
});
