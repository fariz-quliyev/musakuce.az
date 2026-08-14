import { fieldA11yProps, fieldClasses } from "./FormField";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
};

export function Input({ id, error, hint, className, ...props }: InputProps) {
  return (
    <input
      className={cn(fieldClasses(error), className)}
      {...fieldA11yProps(id ?? "", hint, error)}
      {...props}
    />
  );
}
