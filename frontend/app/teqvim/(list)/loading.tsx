import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton for the Təqvim list only — hence the (list) route group.
 *
 * A loading.tsx sitting directly in app/teqvim/ would wrap the whole
 * segment, including app/teqvim/[id]/. That Suspense boundary makes
 * Next.js flush the HTML shell — and with it the HTTP 200 — before the
 * detail page's data resolves, so a deleted or unknown id rendered the
 * 404 UI under a 200 status (a soft 404; measured on production before
 * this move). Route groups don't appear in the URL, so keeping page.tsx
 * and loading.tsx together in (list) leaves /teqvim exactly as it was
 * while letting /teqvim/[id] call notFound() before anything streams,
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
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
