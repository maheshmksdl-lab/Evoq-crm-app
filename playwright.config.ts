import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests run against a production build (`npm run build && npm run start:e2e`).
 * They use the machine's installed Chrome so no browser download is needed.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
