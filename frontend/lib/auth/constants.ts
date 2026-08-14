/**
 * Not httpOnly — deliberately readable by client JS. This lets both
 * Server Components (via next/headers) and Client Components (via
 * document.cookie) attach `Authorization: Bearer <token>` themselves,
 * which is what actually authorizes API calls; the cookie's mere
 * presence grants nothing on its own (the backend never trusts cookies,
 * only the Authorization header), so this isn't exposed to classic CSRF
 * the way ambient session cookies are. Tradeoff: readable by an XSS
 * payload on this origin — same exposure as any browser-stored JWT.
 */
export const AUTH_COOKIE_NAME = "musakuce_admin_token";
