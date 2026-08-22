import Link from "next/link";

type RelatedSection = { href: string; label: string; description: string };

/**
 * Small "see also" link block pointing a list page toward other
 * relevant sections (internal-linking audit: pages like /tariximiz and
 * /insanlarimiz had no outbound links to related content at all). Same
 * visual shape as the hand-rolled "Kəndin yaddaşı" block on /kendimiz
 * (SectionHeading-style eyebrow + a row of link cards) — not extracted
 * from there to avoid touching that already-working page.
 */
export function RelatedSections({ title = "Bunlara da baxın", sections }: { title?: string; sections: RelatedSection[] }) {
  return (
    <div className="mt-14 border-t border-stone-light pt-8">
      <p className="mb-5 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
        {title}
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex items-start justify-between gap-2 border-b border-transparent pb-1 hover:border-forest-light/60"
          >
            <span>
              <span className="block font-display text-[length:var(--text-h4)] text-ink group-hover:text-forest">{section.label}</span>
              <span className="mt-1 block text-sm text-ink-soft">{section.description}</span>
            </span>
            <span aria-hidden className="mt-1 text-forest transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
