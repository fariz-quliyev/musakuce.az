/**
 * Thin fetch wrapper for the Musakuce.Api backend. Every call can fail
 * (backend not running yet, not seeded, network error) — callers are
 * expected to catch and fall back to `lib/mock-content.ts` until the API
 * is actually wired up end-to-end. See `lib/api/withFallback.ts`.
 *
 * Auth (Phase 7): every request transparently gets an `Authorization:
 * Bearer <token>` header attached when an admin session token is
 * present — in the browser via document.cookie, on the server via
 * next/headers' cookies() (dynamically imported so this file stays
 * importable from Client Components, which never execute that branch).
 * Public, anonymous endpoints ignore the header; the token only matters
 * for the admin-privileged calls that actually require it. A 401 always
 * means "not authenticated as admin" (public GETs never return one), so
 * it's safe to react to centrally by sending the caller to /admin/login.
 */

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5295";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function getBrowserToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    const token = getBrowserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const token = store.get(AUTH_COOKIE_NAME)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    // Not inside a request-scoped Server Component/Route Handler
    // (e.g. called at module scope) — proceed unauthenticated.
    return {};
  }
}

/** Any 401 means "admin auth required" — public endpoints never issue
 * one. Redirect to login rather than surfacing a raw error. */
async function handleUnauthorized(): Promise<never> {
  if (typeof window !== "undefined") {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  } else {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  throw new ApiError("Authentication required.", 401);
}

async function request<T>(
  path: string,
  options: RequestInit & { query?: Record<string, unknown>; revalidate?: number } = {},
): Promise<T> {
  const { query, revalidate, ...init } = options;
  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;
  const authHeaders = await getAuthHeaders();

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...init.headers,
    },
    // Only set when a caller opts in (see apiClient.get's revalidate
    // param) — every other call keeps today's fully-dynamic, always-
    // fresh behavior unchanged, which matters most for admin pages.
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  if (response.status === 401) {
    return handleUnauthorized();
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      // Non-JSON error body — ignore, status text is enough.
    }
    throw new ApiError(`API request failed: ${response.status} ${response.statusText}`, response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  /** `revalidate` (seconds) opts a single call into Next.js's fetch
   * cache — omit it (the default everywhere except the homepage) to
   * keep today's always-fresh, per-request behavior. */
  get: <T>(path: string, query?: Record<string, unknown>, revalidate?: number) =>
    request<T>(path, { method: "GET", query, revalidate }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
};
