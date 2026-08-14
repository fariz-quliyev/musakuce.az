import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "memorial";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/**
 * Opens a homepage/section block: small uppercase eyebrow label, a large
 * display-serif heading, and an optional supporting line. Used instead of
 * a generic "card grid" header so each section keeps its own editorial
 * identity (spec §3/§5).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const isMemorial = tone === "memorial";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)]",
            isMemorial ? "text-memorial-accent" : "text-terracotta",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          "font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance",
          isMemorial ? "text-memorial-ink" : "text-ink",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            isMemorial ? "text-memorial-ink/80" : "text-ink-soft",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
