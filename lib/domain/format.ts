import { DAY_MS } from "./rules-config";
import { now } from "./clock";

let currency = "INR";
export function setCurrency(c: string) {
  currency = c;
}
const locale = () => (currency === "INR" ? "en-IN" : "en-US");

export function money(n: number | null | undefined, opts: { compact?: boolean } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(locale(), {
    style: "currency", currency, maximumFractionDigits: opts.compact ? 1 : 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(n);
}
export function num(n: number) {
  return new Intl.NumberFormat(locale()).format(n);
}
export function pct(n: number | null) {
  return n === null ? "—" : `${Math.round(n)}%`;
}

export function date(iso: string | number | null | undefined) {
  if (iso === null || iso === undefined || iso === "") return "—";
  const d = typeof iso === "number" ? new Date(iso) : /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function dateTime(iso: string | number | null | undefined) {
  if (iso === null || iso === undefined || iso === "") return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}
export function time(iso: string | number) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "in 3 days", "2 hours ago", "today" */
export function relative(ts: number | string | null | undefined) {
  if (ts === null || ts === undefined || ts === "") return "—";
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  const diff = t - now();
  const abs = Math.abs(diff);
  const fmt = (v: number, u: string) => `${v} ${u}${v === 1 ? "" : "s"}`;
  let s: string;
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) s = fmt(Math.round(abs / 60_000), "min");
  else if (abs < DAY_MS) s = fmt(Math.round(abs / 3_600_000), "hour");
  else if (abs < 30 * DAY_MS) s = fmt(Math.round(abs / DAY_MS), "day");
  else if (abs < 365 * DAY_MS) s = fmt(Math.round(abs / (30 * DAY_MS)), "month");
  else s = fmt(Math.round(abs / (365 * DAY_MS)), "year");
  return diff < 0 ? `${s} ago` : `in ${s}`;
}

/** yyyy-mm-ddThh:mm in local time for <input type="datetime-local"> */
export function toLocalInput(iso: string | number) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function fromLocalInput(v: string) {
  return new Date(v).toISOString();
}
export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
