import { Badge } from "@/components/ui/Badge";

/**
 * Honest little marker for whether a page's content came from the live
 * API or the mock-content fallback — never present placeholder data as
 * if it were real (spec principle carried over from the photography
 * pass). Renders nothing once the backend is live everywhere.
 */
export function DataSourceNote({ isLive }: { isLive: boolean }) {
  if (isLive) return null;
  return (
    <Badge tone="info" className="mb-4">
      Nümunə məlumat — backend hələ qoşulmayıb
    </Badge>
  );
}
