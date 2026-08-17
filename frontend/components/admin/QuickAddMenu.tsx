"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const ITEMS = [
  { label: "Şəxs", href: "/admin/insanlar/yeni" },
  { label: "Foto", href: "/admin/fotoalbom/yeni" },
  { label: "Video", href: "/admin/videolar/yeni" },
  { label: "Tarix qeydi", href: "/admin/tarix/yeni" },
  { label: "Tədbir", href: "/admin/teqvim/yeni" },
  { label: "Faydalı məlumat", href: "/admin/faydali-melumatlar/yeni" },
];

/** Replaces the previous row of six same-weight "+ X əlavə et" buttons
 * with a single disclosure — no design-system menu component existed to
 * reuse, so this is a minimal button+popover built from existing tokens
 * (no new dependency). */
export function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <Button type="button" size="sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        + Yeni əlavə et
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-stone-light bg-paper py-1 shadow-md"
        >
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-soft hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
