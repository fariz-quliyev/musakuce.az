import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton for the İnsanlarımız list only — hence the (list) route group.
 *
 * A loading.tsx sitting directly in app/insanlarimiz/ would wrap the whole
 * segment, including app/insanlarimiz/[id]/. That Suspense boundary makes
 * Next.js flush the HTML shell — and with it the HTTP 200 — before the
 * detail page's data resolves, so a deleted or unknown id rendered the
 * 404 UI under a 200 status (a soft 404; measured on production before
 * this move). Route groups don't appear in the URL, so keeping page.tsx
 * and loading.tsx together in (list) leaves /insanlarimiz exactly as it was
 * while letting /insanlarimiz/[id] call notFound() before anything streams,
 * which is what lets Next set a real 404. Documented pattern: Next.js
 * "Opting for loading skeletons on a specific route" plus the status-code
 * note in the loading.js reference.
 *
 * Don't move this file back up a level.
 */
export default function Loading() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
