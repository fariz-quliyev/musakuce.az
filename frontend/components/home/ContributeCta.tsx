import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

// All four contribution types carry equal weight — same outline style,
// no primary/secondary split — so nothing implies a hierarchy between a
// photo, a video, a memory and a piece of history.
const ACTIONS = [
  { label: "Foto göndər", href: "/paylas?kind=Photo" },
  { label: "Video göndər", href: "/paylas?kind=Video" },
  { label: "Xatirə paylaş", href: "/paylas?kind=Memory" },
  { label: "Tarixi məlumat göndər", href: "/paylas?kind=HistoricalInfo" },
];

/** "Yaddaşa töhfə" — the community-contribution invitation that closes
 * the homepage, on the one solid primary band. */
export function ContributeCta() {
  return (
    <section className="bg-primary">
      <Container className="py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] font-semibold text-text-on-primary text-balance">
          Musaküçənin yaddaşını birlikdə yaşadaq
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-on-primary/85">
          Köhnə foto, video, sənəd və ya kəndimiz haqqında maraqlı məlumatınız varsa, bizimlə paylaşın.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {ACTIONS.map((action) => (
            <Button
              key={action.label}
              href={action.href}
              variant="outline"
              size="md"
              className="border-text-on-primary/40 text-text-on-primary hover:bg-text-on-primary/10"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Container>
    </section>
  );
}
