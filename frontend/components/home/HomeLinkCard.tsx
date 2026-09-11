import Link from "next/link";

type HomeLinkCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Optional live figure, e.g. "3 aktiv elan" — omitted, never guessed, when unknown. */
  meta?: string;
};

/**
 * Signpost card for the homepage's "Musaküçə haqqında" and "Kənd həyatı"
 * rows — Riseley's flat tinted "Village Information" boxes, adapted: an
 * icon, a title, one sentence, and an arrow. The whole card is the link;
 * it exists to send the visitor to the inner page, not to hold content.
 */
export function HomeLinkCard({ href, icon, title, description, meta }: HomeLinkCardProps) {
  return (
    // Icon beside the text on one-column mobile (keeps eight stacked cards
    // from becoming a long scroll); icon above the text from sm up.
    <Link
      href={href}
      className="group flex h-full gap-4 rounded-lg border border-transparent bg-surface-tint p-5 transition-colors hover:border-primary-light sm:flex-col sm:gap-0 sm:p-6"
    >
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface text-primary">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-[length:var(--text-h4)] leading-[var(--text-h4--line-height)] font-semibold text-text sm:mt-5">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-text-muted sm:mt-2">{description}</p>
        <span className="mt-auto flex items-center justify-between pt-3 text-sm font-semibold text-primary sm:pt-5">
          <span className="text-xs font-medium text-text-muted">{meta}</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Shared stroke-icon props for the signpost cards. */
export const linkCardIconProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};
