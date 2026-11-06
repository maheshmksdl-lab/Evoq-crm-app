import { expect, type Page } from "@playwright/test";

export const CREDS = { email: "tech@evoq.one", password: "Sdl@T3#1" };

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(CREDS.email);
  await page.getByLabel("Password", { exact: true }).fill(CREDS.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Good (morning|afternoon|evening)/);
}

/** Collects uncaught page errors and console errors so a "green" page that logs errors still fails. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/Failed to load resource.*(404|favicon)/i.test(t)) return;
    errors.push(`console: ${t}`);
  });
  return errors;
}
