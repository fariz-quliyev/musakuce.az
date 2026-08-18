/**
 * Runs a live API call and falls back to mock data if it fails — the
 * backend may not be running, seeded, or reachable yet. Every route page
 * uses this so the site stays usable end-to-end before the API is fully
 * wired up, per the Phase 4 requirement to keep mock-content usable
 * until real data is connected.
 *
 * Security-audit fix (§Phase 3): outside production, a real fetch
 * failure still resolves to the caller's `fallback` unchanged — useful
 * for local development without a running backend, which is what this
 * function was originally built for. In production, a fetch failure
 * must never resolve to fabricated example content that a real visitor
 * could mistake for the actual archive (the audit's concrete example:
 * /tariximiz's mock historical events have specific invented dates and
 * descriptions) — so the caller's `fallback` is narrowed to its
 * structurally-empty equivalent instead (see `toProductionSafeFallback`
 * below), and `isLive` still comes back `false` so `DataSourceNote`
 * renders its outage message. This keeps every existing call site's
 * signature and "hide honestly if empty" rendering path unchanged —
 * only the *data* substituted on failure changes, and only in
 * production.
 */
export async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; isLive: boolean }> {
  try {
    const data = await fetcher();
    return { data, isLive: true };
  } catch {
    const safeFallback = process.env.NODE_ENV === "production" ? toProductionSafeFallback(fallback) : fallback;
    return { data: safeFallback, isLive: false };
  }
}

/**
 * Structural, type-agnostic "keep the shape, drop the invented content"
 * transform — deliberately generic rather than per-call-site, so this
 * one change covers every existing `withFallback` caller without
 * touching them individually (and without any of them being able to
 * quietly regress back to showing mock content by omission).
 *
 * - Arrays become empty (this is already how every homepage section's
 *   fallback is written today — e.g. `components/home/OurHistory.tsx`'s
 *   `FALLBACK_EVENTS: HistoricalEventDto[] = []` — so this is a no-op
 *   for those, and only changes behavior for the page-level
 *   `PagedResult<T>` fallbacks that still ship 2-3 populated mock items.
 * - A `PagedResult<T>`-shaped object (`items` + pagination fields) keeps
 *   its shape but with `items` emptied and counts zeroed, so it flows
 *   into each page's own existing empty-state rendering unchanged.
 * - Anything else (a singleton config-shaped object, e.g.
 *   VillageProfileDto or TimelineSettingsDto) is returned as-is: those
 *   fallbacks were reviewed as part of this fix and contain generic
 *   template copy, not specific invented facts, and — unlike a list of
 *   "historical events" — have no natural empty representation to fall
 *   back to further.
 */
function toProductionSafeFallback<T>(fallback: T): T {
  if (Array.isArray(fallback)) return [] as unknown as T;

  if (
    fallback !== null &&
    typeof fallback === "object" &&
    "items" in fallback &&
    Array.isArray((fallback as { items: unknown }).items)
  ) {
    return { ...fallback, items: [], totalCount: 0, totalPages: 0 } as T;
  }

  return fallback;
}
