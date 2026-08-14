import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

// Foto göndər/Xatirə paylaş are the two contribution types the archive
// most needs and can act on immediately (a photo or a memory needs no
// further research to be useful); Video göndər/Tarixi məlumat göndər
// stay available but read as secondary actions rather than four
// equally-weighted buttons.
const ACTIONS = [
  { label: "Foto göndər", href: "/paylas?kind=Photo", primary: true },
  { label: "Xatirə paylaş", href: "/paylas?kind=Memory", primary: true },
  { label: "Video göndər", href: "/paylas?kind=Video", primary: false },
  { label: "Tarixi məlumat göndər", href: "/paylas?kind=HistoricalInfo", primary: false },
];

/** Prominent community-contribution CTA — forest band so it reads as a
 * warm invitation, not a form-page teaser. */
export function ContributeCta() {
  return (
    <div className="bg-forest">
      <Container className="py-16 text-center sm:py-20">
        <p className="mb-3 text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-moss-light">
          Birlikdə qoruyaq
        </p>
        <h2 className="mx-auto max-w-2xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-cream text-balance">
          Musaküçənin yaddaşına sən də əlavə et
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/80">
          Köhnə fotolarınız, videolarınız, xatirələriniz və ya tarixi
          məlumatınız var? Bizimlə paylaşın — moderasiyadan sonra kənd
          arxivinin bir parçası olsun.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {ACTIONS.map((action) => (
            <Button
              key={action.label}
              href={action.href}
              variant={action.primary ? "secondary" : "outline"}
              size="md"
              className={action.primary ? undefined : "border-cream/40 text-cream hover:bg-cream/10"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Container>
    </div>
  );
}
