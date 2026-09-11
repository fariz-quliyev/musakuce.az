import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

/** Background bands, alternated down the homepage the way Riseley
 * alternates white / #fafafa / #f4f4f6 — enough to separate sections
 * without any section looking like a different design. */
const BANDS = {
  plain: "bg-background",
  muted: "bg-surface-muted",
  alt: "bg-surface-alt",
} as const;

type HomeSectionProps = {
  title: string;
  description?: string;
  /** The section's single way onward, e.g. "Bütün xəbərlər". */
  cta?: { label: string; href: string };
  band?: keyof typeof BANDS;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Shared frame for every homepage section: one spacing rhythm, one
 * heading style, one "… →" link placed top-right (below the heading on
 * mobile). The homepage is a doorway to the inner pages, so each section
 * shows a small taste and hands off through that link.
 */
export function HomeSection({ title, description, cta, band = "plain", id, className, children }: HomeSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-20", BANDS[band], className)}>
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 sm:mb-10">
          <SectionHeading title={title} description={description} />
          {cta ? <ArrowLink href={cta.href}>{cta.label}</ArrowLink> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

/** Text link with a trailing arrow — the homepage's one CTA style. */
export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-link transition-colors hover:text-link-hover",
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
