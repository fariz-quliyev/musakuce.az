/**
 * next/navigation's redirect() works by throwing a special error that
 * Next.js's rendering pipeline catches to perform the actual redirect.
 * Any try/catch around code that might call redirect() (directly, or
 * transitively via apiClient's central 401 handler) MUST re-throw this
 * specific error instead of swallowing it — otherwise the redirect
 * silently never happens. There's no public isRedirectError export for
 * the App Router yet, so this checks the documented "NEXT_REDIRECT"
 * digest convention directly.
 */
export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
