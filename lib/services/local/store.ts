import { Db, type Collection } from "@/lib/schemas";
import { buildSeed } from "./seed";

/**
 * LOCAL ADAPTER — browser persistence standing in for the CRM backend.
 *
 * - One versioned snapshot in localStorage (`evoq-crm:db:v1`), validated with Zod on load.
 *   A corrupt or incompatible snapshot is NOT silently replaced: it is kept under a backup
 *   key and the app starts from the seed with `loadIssue` set so the UI can say so.
 * - Writes are immutable: every commit produces a new top-level object and new arrays for
 *   the collections it touched. Derived indexes (lib/domain/activity) key off the snapshot.
 * - Cross-tab: a `storage` event reloads the snapshot and notifies subscribers (the query
 *   client invalidates). Real multi-user concurrency is a backend concern.
 */
export const STORAGE_KEY = "evoq-crm:db:v1";
const BACKUP_KEY = "evoq-crm:db:corrupt-backup";

let db: Db | null = null;
let loadIssue: string | null = null;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function load(): Db {
  const ls = storage();
  const raw = ls?.getItem(STORAGE_KEY);
  if (!raw) return buildSeed();
  try {
    const parsed = Db.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    ls?.setItem(BACKUP_KEY, raw);
    loadIssue = "Saved CRM data did not match the current format, so sample data was loaded. The previous data was kept as a backup in this browser.";
    console.error("[evoq-crm] stored snapshot failed validation", parsed.error.issues.slice(0, 5));
  } catch {
    ls?.setItem(BACKUP_KEY, raw);
    loadIssue = "Saved CRM data could not be read, so sample data was loaded. The previous data was kept as a backup in this browser.";
  }
  return buildSeed();
}

export function getDb(): Db {
  if (!db) db = load();
  return db;
}
export function getLoadIssue() {
  return loadIssue;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

function persist(next: Db) {
  const ls = storage();
  if (!ls) return;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new StorageError("This browser's storage is full, so the change was not saved. Remove large attachments or export a backup and reset sample data.");
  }
}

/**
 * Apply a write. `fn` receives a shallow copy of the snapshot and must REPLACE (not mutate)
 * any collection it changes. If persisting fails, the in-memory state is not changed.
 */
export function commit<T>(fn: (draft: Db) => T): T {
  const current = getDb();
  const draft: Db = { ...current, settings: { ...current.settings }, counters: { ...current.counters } };
  const result = fn(draft);
  persist(draft);
  db = draft;
  listeners.forEach((l) => l());
  return result;
}

export function nextId(draft: Db, key: Collection | "customFields"): string {
  const n = (draft.counters[key] ?? 0) + 1;
  draft.counters[key] = n;
  return String(n);
}

export function replaceAll(next: Db) {
  const parsed = Db.parse(next);
  persist(parsed);
  db = parsed;
  loadIssue = null;
  listeners.forEach((l) => l());
}

export function resetToSeed() {
  replaceAll(buildSeed());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    db = null;
    getDb();
    listeners.forEach((l) => l());
  });
}

/** Test helper */
export function __resetForTests(seed?: Db) {
  db = seed ?? buildSeed();
  loadIssue = null;
}
