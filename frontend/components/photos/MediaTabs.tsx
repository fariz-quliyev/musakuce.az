import Link from "next/link";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "photo", label: "Foto", href: "/fotoalbom" },
  { key: "video", label: "Video", href: "/videolar" },
] as const;

/**
 * Foto / Video switch shown at the top of /fotoalbom and /videolar, so
 * videos sit inside the "Fotoalbom" section rather than needing their
 * own header item. Plain links between the two existing routes — no
 * routing change, and each tab stays a real, shareable URL.
 */
export function MediaTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Foto və video" className="mb-8 flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
              isActive ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-primary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
