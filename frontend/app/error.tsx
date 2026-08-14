"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Site-wide error boundary — previously missing (only /admin had one),
 * so an unhandled exception anywhere on the public site fell through to
 * Next.js's generic unstyled error page. Next.js redacts the real error
 * crossing this boundary, so this stays generic and never echoes
 * `error.message` — no stack traces, connection strings, or internal
 * paths reach the browser.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageShell>
      <Container className="flex min-h-[50vh] items-center justify-center py-20">
        <EmptyState
          tone="error"
          title="Gözlənilməz xəta baş verdi"
          description="Bu səhifəni yükləmək mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reset}>
                Yenidən cəhd et
              </Button>
              <Button size="sm" href="/">
                Ana səhifəyə qayıt
              </Button>
            </div>
          }
        />
      </Container>
    </PageShell>
  );
}
