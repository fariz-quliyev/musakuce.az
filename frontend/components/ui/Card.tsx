import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardStyles = cva("overflow-hidden rounded-lg border transition-shadow", {
  variants: {
    variant: {
      /** Archive content: photos, people, history, culture. */
      default:
        "border-stone-light bg-paper shadow-sm hover:shadow-md",
      /** Village Square: classifieds, events, local info — same family,
       *  slightly warmer surface so it never reads as a marketplace. */
      square:
        "border-clay-light bg-paper shadow-sm hover:shadow-md",
      /** Xatirə/memorial — calm, muted, no hover-lift, no bright shadow. */
      memorial:
        "border-memorial-line bg-memorial-surface shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardStyles>;

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardStyles({ variant }), "flex flex-col", className)} {...props} />;
}

type CardMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  aspect?: "video" | "square" | "portrait" | "wide";
};

const aspectStyles: Record<NonNullable<CardMediaProps["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
};

export function CardMedia({
  aspect = "video",
  className,
  children,
  ...props
}: CardMediaProps) {
  return (
    <div
      className={cn(aspectStyles[aspect], "relative w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-1 flex-col p-5", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "line-clamp-2 font-display text-[length:var(--text-h4)] leading-[var(--text-h4--line-height)] text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-2 text-sm leading-relaxed text-ink-soft", className)}
      {...props}
    />
  );
}

export function CardMeta({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-ink-faint",
        className,
      )}
      {...props}
    />
  );
}
