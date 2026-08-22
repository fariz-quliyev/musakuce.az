import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Səhifə tapılmadı — Musaküçə",
  robots: { index: false, follow: false },
};

// A curated handful of the site's main sections, not the full 10-item
// primary nav — enough for a lost visitor to find their way without
// this just becoming a second navbar.
const MAIN_SECTIONS = [
  { href: "/kendimiz", label: "Kəndimiz" },
  { href: "/tariximiz", label: "Tariximiz" },
  { href: "/insanlarimiz", label: "İnsanlarımız" },
  { href: "/fotoalbom", label: "Fotoalbom" },
  { href: "/elanlar", label: "Elanlar" },
];

/**
 * Site-wide 404 — previously missing entirely, so every notFound() call
 * anywhere on the public site (any /xxx/[id] detail page with a bad or
 * unpublished id) fell through to Next.js's generic unstyled default
 * page instead of something that reads as part of Musakuce.az.
 */
export default function NotFound() {
  return (
    <PageShell>
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-8 py-20">
        <EmptyState
          title="Bu səhifə tapılmadı"
          description="Axtardığınız məzmun mövcud deyil, silinib və ya hələ dərc edilməyib."
          action={
            <Button href="/" size="sm">
              Ana səhifəyə qayıt
            </Button>
          }
        />
        <nav aria-label="Əsas bölmələr" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {MAIN_SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className="text-sm font-medium text-forest hover:underline">
              {section.label}
            </Link>
          ))}
        </nav>
      </Container>
    </PageShell>
  );
}
