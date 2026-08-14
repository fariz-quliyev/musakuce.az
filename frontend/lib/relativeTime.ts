/**
 * "Bu gün kənddə" bulletin items with a real date (currently only
 * Listings — `postedAt` — since Photo only carries `takenDate`, which is
 * when the photo was taken, not when it was added, so it isn't a
 * meaningful "recency" signal) render a relative time label instead of
 * a raw date. Returns null for anything older than a week, where an
 * absolute date reads better than "N gün əvvəl".
 */
export function formatRelativeTimeAz(dateIso: string): string | null {
  const then = new Date(dateIso).getTime();
  if (Number.isNaN(then)) return null;

  const diffMs = Date.now() - then;
  if (diffMs < 0) return null;

  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return "Az əvvəl";
  if (diffHours < 24) return `${Math.floor(diffHours)} saat əvvəl`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Dünən";
  if (diffDays <= 7) return `${diffDays} gün əvvəl`;

  return null;
}
