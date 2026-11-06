/** Single clock for all rules so tests can pin "now". */
let fixed: number | null = null;

export function now(): number {
  return fixed ?? Date.now();
}
export function nowIso(): string {
  return new Date(now()).toISOString();
}
export function setNowForTests(ms: number | null) {
  fixed = ms;
}
/** Local yyyy-mm-dd for "today". */
export function todayIso(): string {
  const d = new Date(now());
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/** End of a yyyy-mm-dd day in local time (tasks are due by end of day). */
export function endOfDay(dateIso: string): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}
