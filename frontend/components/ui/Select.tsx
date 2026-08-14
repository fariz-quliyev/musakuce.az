import { fieldA11yProps, fieldClasses } from "./FormField";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  hint?: string;
};

export function Select({
  id,
  error,
  hint,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldClasses(error),
          "appearance-none pr-9",
          className,
        )}
        {...fieldA11yProps(id ?? "", hint, error)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft"
      >
        <path
          d="M5.5 7.5 10 12l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
