import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "header" | "footer" | "main";
};

/** Consistent editorial max-width + mobile-first side padding. */
export function Container({
  as: Tag = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
