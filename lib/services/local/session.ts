import { LEGACY_COOKIE, SESSION_COOKIE } from "@/lib/session-cookie";

/** Client-side session (local adapter). A real backend issues an httpOnly session cookie instead. */
const MAX_AGE = 60 * 60 * 24 * 7;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}

export function getSessionUserId(): string | null {
  const id = readCookie(SESSION_COOKIE);
  if (id) return id;
  // Pre-migration sessions (crm_auth=true) belonged to the single tech@evoq.one account.
  return readCookie(LEGACY_COOKIE) === "true" ? "0" : null;
}

export function setSessionUserId(id: string) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  document.cookie = `${LEGACY_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${LEGACY_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
