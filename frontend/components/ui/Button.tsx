import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-forest text-ink-on-dark hover:bg-forest-dark",
        secondary:
          "bg-terracotta text-ink-on-dark hover:bg-terracotta-dark",
        outline:
          "border border-stone bg-transparent text-ink hover:bg-paper-soft",
        ghost: "bg-transparent text-forest hover:bg-moss-light",
        memorial:
          "border border-memorial-line bg-memorial-surface text-memorial-ink hover:bg-memorial-bg",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonOwnProps = VariantProps<typeof buttonStyles> & {
  className?: string;
  loading?: boolean;
};

type ButtonAsButton = ButtonOwnProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonOwnProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a <Link> when `href` is given, a <button> otherwise. Loading
 * state disables interaction and shows an inline spinner without
 * changing the button's size (so layout doesn't shift).
 */
export function Button({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonStyles({ variant, size }), className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { disabled, ...rest } = props as ButtonAsButton;
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
