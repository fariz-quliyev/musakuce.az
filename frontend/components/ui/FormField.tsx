import { cn } from "@/lib/cn";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Label + help/error text wrapper shared by every form control. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-terracotta">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared field classnames + aria wiring so Input/Textarea/Select match. */
export function fieldA11yProps(id: string, hint?: string, error?: string) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}

export const fieldClasses = (error?: string) =>
  cn(
    "w-full rounded-md border bg-paper-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta",
    error ? "border-danger" : "border-stone-light hover:border-stone",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );
