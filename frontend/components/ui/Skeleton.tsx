import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-stone-light/70", className)}
      {...props}
    />
  );
}

/** Loading placeholder shaped like a `Card` (media + title + meta lines). */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-light bg-paper">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
