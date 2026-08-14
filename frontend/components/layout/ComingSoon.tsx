import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Honest placeholder for sections that are named in the navigation/spec
 * but don't have a backing content module yet (no Memorial/Interview/
 * CulturalItem entities exist as of Phase 6) — better than a dead "#"
 * link or a page that pretends to have content.
 */
export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} className="mb-10" />
      <EmptyState
        title="Bu bölmə hazırlanır"
        description="Bu hissə üzərində hələ işləyirik. Töhfə vermək istəyirsinizsə, bizimlə paylaşa bilərsiniz."
        action={
          <Button href="/paylas?kind=Memory" size="sm">
            Paylaş
          </Button>
        }
      />
    </Container>
  );
}
