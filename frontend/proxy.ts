import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Security-audit fix (§Phase 1) — this file already existed for one
 * narrow purpose (the admin cookie-presence redirect below, scoped to
 * /admin/* only); it's now also where the CSP nonce is generated, since
 * that needs to run on every route, not just /admin. Merging both
 * concerns into this one file — rather than adding a second
 * middleware.ts — is required, not a style choice: Next.js 16 only
 * allows one proxy/middleware file per app and errors the build if it
 * finds both `middleware.ts` and `proxy.ts` (confirmed by hitting that
 * exact build error while first attempting the CSP fix as a separate
 * file).
 *
 * CSP-nonce half (all routes matched below): follows Next.js's own
 * documented App Router CSP pattern
 * (https://nextjs.org/docs/app/guides/content-security-policy) — the
 * nonce is threaded through both the outgoing request headers (so
 * Server Components could read it via `headers()` if ever needed) and
 * the response's CSP header, and Next's own script injection for
 * hydration/RSC payloads automatically picks up the nonce from that
 * response header — no manual nonce-threading through every page.
 *
 * script-src has no 'unsafe-inline'/'unsafe-eval' — 'self' + the nonce
 * covers every script Next.js itself injects. 'strict-dynamic' was
 * tried first (nonce-trust propagating to dynamically-inserted scripts
 * without URL allow-listing) but had to be dropped: on routes with a
 * `loading.tsx` Suspense boundary whose real content pulls in a chunk
 * that isn't already part of the fallback's bundle (e.g. /insanlarimiz,
 * /tariximiz), Next 16.3's streamed second-phase render emits that
 * chunk's <script> tag without the nonce attribute at all — a framework
 * gap, not something this app's code controls. Under 'strict-dynamic'
 * that unnonced same-origin script is simply blocked, which broke
 * hydration for the whole page (observed as the header's Link clicks
 * silently doing nothing — Navbar itself is one such late-discovered
 * chunk on those routes). Root-caused by intercepting the response and
 * confirming removing 'strict-dynamic' alone fixes it. 'self' still
 * restricts script-src to same-origin only — this app has no
 * user-uploaded/served JS, so that remains a real restriction, just not
 * as strict as 'strict-dynamic'. style-src keeps
 * 'unsafe-inline' deliberately: this codebase uses React inline
 * `style={{...}}` attributes for values that can only be known at
 * render time (e.g. HistoryTimeline's computed caret position,
 * map-picker pin coordinates) — CSP has no nonce/hash mechanism for
 * style *attributes* (only for <style> block elements), so there is no
 * script-src-equivalent strict option here without rewriting every
 * dynamic-position component to inject a <style> tag instead. This is
 * the standard, well-understood tradeoff for React apps — style-src
 * 'unsafe-inline' cannot execute JavaScript, only apply CSS.
 *
 * Admin-gate half (only when the path is under /admin, excluding
 * /admin/login): unchanged from before this fix — presence-only check,
 * Edge middleware has no JWT verification library here, so this is a
 * UX convenience/first line of defense, not the security boundary
 * (every API call independently re-validates the token server-side —
 * see Program.cs's JWT bearer + policy checks).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const mediaHost = (() => {
    const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    if (!raw) return "";
    try {
      return new URL(raw).origin;
    } catch {
      return "";
    }
  })();

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    // Map tile hosts for /xerite's 3 switchable base layers
    // (PlacesMap.tsx) — all keyless/free, no registration or billing:
    // OpenStreetMap (street), Esri World Imagery (satellite), OpenTopoMap
    // (relief). Without these, tile requests are CSP-blocked and the
    // layer renders as an empty grey box — confirmed by intercepting the
    // failed requests (reason: "csp") for the original OSM-only layer.
    `img-src 'self' data: blob: https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org ${mediaHost}`.trim(),
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login";
  if (isAdminRoute && !request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every route except static assets and the image optimizer, which
    // don't need a fresh nonce and shouldn't pay the middleware cost.
    // Broadened from the pre-existing /admin-only matcher (kept as the
    // in-function `isAdminRoute` check above instead) so the CSP nonce
    // covers the whole site, not just /admin.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)",
  ],
};
