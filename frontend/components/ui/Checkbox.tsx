import { cn } from "@/lib/cn";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
};

export function Checkbox({
  id,
  label,
  description,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 text-sm text-ink",
        className,
      )}
    >
      <input
        type="checkbox"
        id={id}
        className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-stone text-forest accent-forest focus-visible:outline-2 focus-visible:outline-terracotta"
        {...props}
      />
      <span>
        <span className="font-medium">{label}</span>
        {description ? (
          <span className="block text-xs text-ink-faint">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
