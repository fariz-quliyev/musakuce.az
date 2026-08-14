import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = { label: string; value: string; count?: number };

/** Server-rendered filter tabs — each is a plain link with `?status=`, so
 * the list page (a Server Component) re-fetches with the right filter. */
export function StatusTabs({
  tabs,
  active,
  basePath,
  paramName = "status",
}: {
  tabs: Tab[];
  active: string | undefined;
  basePath: string;
  paramName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-stone-light">
      {tabs.map((tab) => {
        const isActive = (active ?? tabs[0]?.value) === tab.value;
        const href = tab.value ? `${basePath}?${paramName}=${tab.value}` : basePath;
        return (
          <Link
            key={tab.value}
            href={href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-forest text-forest"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? <span className="ml-1.5 text-xs text-ink-faint">({tab.count})</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
