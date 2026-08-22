import Link from "next/link";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = { name: string; path: string };

/**
 * Semantic, responsive breadcrumb trail for content detail pages
 * (Ana səhifə → Bölmə → Məqalə). Takes the exact same `{name, path}[]`
 * shape as `breadcrumbJsonLd` (lib/structuredData.ts) so callers build
 * one items array and feed it to both — keeping the visible trail and
 * the BreadcrumbList JSON-LD from ever drifting apart, which Google's
 * Rich Results guidelines require (the structured data must describe
 * what's actually on the page). The last item is the current page —
 * rendered as plain text with `aria-current="page"`, never a link.
 */
export function Breadcrumbs({
  items,
  /** "memorial" matches the /xatire page's dark/muted-accent palette
   * (same tone-prop convention as SuggestionCta) — every other content
   * type uses the site's default forest/ink palette. */
  tone = "default",
}: {
  items: BreadcrumbItem[];
  tone?: "default" | "memorial";
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-4 -mx-1 overflow-x-auto px-1", tone === "memorial" ? "text-memorial-accent" : "text-ink-soft")}
    >
      <ol className="flex items-center gap-1.5 text-sm whitespace-nowrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex shrink-0 items-center gap-1.5">
              {i > 0 ? (
                <span aria-hidden className={tone === "memorial" ? "text-memorial-line" : "text-ink-faint"}>
                  /
                </span>
              ) : null}
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn("max-w-[240px] truncate font-medium", tone === "memorial" ? "text-memorial-ink" : "text-ink")}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className={cn(
                    "max-w-[160px] truncate transition-colors hover:underline",
                    tone === "memorial" ? "hover:text-memorial-ink" : "hover:text-forest",
                  )}
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
