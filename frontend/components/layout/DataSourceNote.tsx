import { Badge } from "@/components/ui/Badge";

/**
 * Honest little marker for whether a page's content came from the live
 * API or the mock-content fallback — never present placeholder data as
 * if it were real (spec principle carried over from the photography
 * pass). Renders nothing once the backend is live everywhere.
 *
 * Security-audit fix (§Phase 3): the copy is now environment-aware.
 * `withFallback` (lib/api/withFallback.ts) only ever substitutes
 * populated mock content for a failed fetch outside production — in
 * production, `isLive: false` always means a real API/DB failure just
 * happened (never "intentionally showing demo data while the backend
 * isn't wired up yet"), so it needs its own, honest wording rather than
 * the dev-oriented "backend hələ qoşulmayıb" message, which would be
 * actively misleading during a real production outage.
 */
export function DataSourceNote({ isLive }: { isLive: boolean }) {
  if (isLive) return null;
  const isProduction = process.env.NODE_ENV === "production";
  return (
    <Badge tone={isProduction ? "warning" : "info"} className="mb-4">
      {isProduction ? "Məlumat müvəqqəti əlçatan deyil — bir azdan yenidən cəhd edin" : "Nümunə məlumat — backend hələ qoşulmayıb"}
    </Badge>
  );
}
