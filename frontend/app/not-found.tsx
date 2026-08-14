import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Səhifə tapılmadı — Musaküçə",
  robots: { index: false, follow: false },
};

/**
 * Site-wide 404 — previously missing entirely, so every notFound() call
 * anywhere on the public site (any /xxx/[id] detail page with a bad or
 * unpublished id) fell through to Next.js's generic unstyled default
 * page instead of something that reads as part of Musakuce.az.
 */
export default function NotFound() {
  return (
    <PageShell>
      <Container className="flex min-h-[50vh] items-center justify-center py-20">
        <EmptyState
          title="Bu səhifə tapılmadı"
          description="Axtardığınız məzmun mövcud deyil, silinib və ya hələ dərc edilməyib."
          action={
            <Button href="/" size="sm">
              Ana səhifəyə qayıt
            </Button>
          }
        />
      </Container>
    </PageShell>
  );
}
