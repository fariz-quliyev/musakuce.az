import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * First line of defense for /admin/* — presence-only check (this is
 * Edge middleware, no JWT verification library here). This is a UX
 * convenience, not the security boundary: every API call independently
 * re-validates the token server-side (Program.cs JWT bearer + policy
 * checks), so a bypassed/spoofed cookie still can't reach real data —
 * see Phase 7 report §7 "Do not rely on client-side checks alone".
 *
 * Named/exported as `proxy` per the Next.js 16 convention (renamed from
 * `middleware.ts`/`export function middleware` in Phase 7).
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
