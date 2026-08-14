/**
 * Runs a live API call and falls back to mock data if it fails — the
 * backend may not be running, seeded, or reachable yet. Every route page
 * uses this so the site stays usable end-to-end before the API is fully
 * wired up, per the Phase 4 requirement to keep mock-content usable
 * until real data is connected.
 */
export async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; isLive: boolean }> {
  try {
    const data = await fetcher();
    return { data, isLive: true };
  } catch {
    return { data: fallback, isLive: false };
  }
}
