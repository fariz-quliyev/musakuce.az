import { cn } from "@/lib/cn";

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Radio({ id, label, className, ...props }: RadioProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 text-sm text-ink",
        className,
      )}
    >
      <input
        type="radio"
        id={id}
        className="h-4.5 w-4.5 shrink-0 cursor-pointer border-stone text-forest accent-forest focus-visible:outline-2 focus-visible:outline-terracotta"
        {...props}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}
