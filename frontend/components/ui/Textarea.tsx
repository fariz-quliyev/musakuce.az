import { fieldA11yProps, fieldClasses } from "./FormField";
import { cn } from "@/lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  hint?: string;
};

export function Textarea({ id, error, hint, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldClasses(error), "min-h-28 resize-y", className)}
      {...fieldA11yProps(id ?? "", hint, error)}
      {...props}
    />
  );
}
