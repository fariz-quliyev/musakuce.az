import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "memorial" | "error";
  className?: string;
};

/** Shown where a list/section has no content yet (e.g. an empty album,
 * an empty moderation queue) — warm and inviting, not a cold "404-style"
 * error block. `tone="error"` reuses the same shape for failed API
 * fetches (with a retry action), just tinted with the existing danger
 * tokens instead of introducing new styling. */
export function EmptyState({
  title,
  description,
  action,
  tone = "default",
  className,
}: EmptyStateProps) {
  const isMemorial = tone === "memorial";
  const isError = tone === "error";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center",
        isMemorial && "border-memorial-line bg-memorial-surface",
        isError && "border-danger/30 bg-danger-bg/40",
        !isMemorial && !isError && "border-stone-light bg-paper-soft",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        fill="none"
        className={cn(
          "h-10 w-10",
          isMemorial && "text-memorial-accent",
          isError && "text-danger",
          !isMemorial && !isError && "text-terracotta",
        )}
      >
        <path
          d="M9 14a4 4 0 0 1 4-4h6l3 4h13a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V14Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M18 27a6 6 0 1 1 12 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="21" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
      <h3 className="font-display text-[length:var(--text-h4)] text-ink">
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
