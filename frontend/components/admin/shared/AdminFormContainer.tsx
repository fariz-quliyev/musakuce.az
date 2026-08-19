"use client";

import { cn } from "@/lib/cn";

/** Shared outer `<form>` wrapper for every admin content-edit form —
 * previously each form set its own `max-w-4xl` independently (some had
 * none at all), which is what left the large unused right-side gap on
 * wide screens (AdminShell's `<main>` itself has no width cap). One
 * shared width here means one place to change it, and every form gets
 * the same amount of the available content area — everything else
 * about each form (FormField grouping, cards, sticky action bar,
 * status picker) stays exactly as it already was. */
export function AdminFormContainer({
  onSubmit,
  children,
  className,
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={cn("grid max-w-6xl gap-5 pb-2", className)}>
      {children}
    </form>
  );
}
