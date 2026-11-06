import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Optimistic route gate (Next 16 "proxy", formerly middleware).
 *
 * This is NOT authorization. It only keeps signed-out visitors on the auth
 * screens. Record-level permissions are enforced in the service layer
 * (lib/services) and must be re-enforced by the real backend.
 */
const PUBLIC_PATHS = new Set(["/login", "/register", "/forgot-password"]);

export function proxy(request: NextRequest) {
  const isAuthed = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!isAuthed && !isPublic) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\.ico|logo\.png|brand/|.*\.svg|.*\.png).*)"],
};
