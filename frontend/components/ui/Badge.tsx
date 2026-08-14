import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeStyles = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "bg-stone-light text-ink-soft",
        forest: "bg-moss-light text-forest-dark",
        terracotta: "bg-clay-light text-terracotta-dark",
        gold: "bg-gold-light text-gold-dark",
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        danger: "bg-danger-bg text-danger",
        info: "bg-info-bg text-info",
        memorial: "bg-memorial-bg text-memorial-accent",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeStyles> & {
    dot?: boolean;
  };

/**
 * Small status/category label — used for source-status tags (Şifahi
 * tarix, Ailə arxivi, Təsdiqlənib…), classified categories, and listing
 * lifecycle states. Deliberately muted tones, no "breaking news" red.
 */
export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ tone }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        />
      ) : null}
      {children}
    </span>
  );
}
