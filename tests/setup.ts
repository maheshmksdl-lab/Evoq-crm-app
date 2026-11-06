import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { __resetForTests } from "@/lib/services/local/store";
import { setNowForTests } from "@/lib/domain/clock";

/** Pinned "now" so date rules are deterministic: Fri 6 Nov 2026 12:00 IST. */
export const NOW = Date.parse("2026-11-06T12:00:00+05:30");

beforeEach(() => {
  window.localStorage.clear();
  document.cookie = "crm_session=0; path=/";
  setNowForTests(NOW);
  __resetForTests();
});
afterEach(() => {
  cleanup();
  setNowForTests(null);
});
