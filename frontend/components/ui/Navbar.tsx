"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const PRIMARY_NAV = [
  { label: "Ana səhifə", href: "/" },
  { label: "Kəndimiz", href: "/kendimiz" },
  { label: "Kəndimizdən", href: "/kendimizden" },
  { label: "İnsanlarımız", href: "/insanlarimiz" },
  { label: "Tariximiz", href: "/tariximiz" },
  { label: "Təhsil", href: "/tehsil" },
  { label: "Fotoalbom", href: "/fotoalbom" },
  { label: "Xəritə", href: "/xerite" },
];

// Eight items, Riseley-style. The Village Square pages (Elanlar, Təqvim,
// Faydalı məlumatlar) are one click away from the homepage's "Kənd
// həyatı" row and listed in Footer.tsx's "Kənd meydanı" column; Xatirə,
// Mədəni irs, Videolar and Kəndimizin səsi in its "Arxiv" column — kept
// out of the bar so it stays short enough to sit on one line from lg up.

/**
 * Header/navigation shell per spec §27, now wired to real routes
 * (Phase 4). Large touch targets and a full-screen mobile menu, per the
 * mobile-first requirement.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ logoImageUrl }: { logoImageUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Musaküçə — ana səhifə">
          {logoImageUrl ? (
            <span className="relative block h-11 w-32">
              <Image src={logoImageUrl} alt="Musaküçə" fill sizes="128px" className="object-contain object-left" priority />
            </span>
          ) : (
            <span className="font-display text-lg font-semibold tracking-tight text-forest sm:text-xl">MUSAKÜÇƏ.AZ</span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 py-0.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-forest text-forest font-semibold"
                    : "border-transparent text-ink-soft hover:border-forest-light hover:text-forest",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/axtaris"
            aria-label="Axtarış"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-soft hover:text-forest"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="h-5 w-5"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="m17 17-3.7-3.7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>

          <button
            type="button"
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-soft hover:text-forest lg:hidden"
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              {open ? (
                <path
                  d="M5 5l10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav
        // `inert` (not just visually hidden) while collapsed keeps these
        // links out of the tab order and hidden from assistive tech — a
        // 0fr/overflow-hidden row can otherwise still receive keyboard
        // focus in some browsers even though nothing is visible.
        inert={!open}
        className={cn(
          "grid gap-1 overflow-hidden border-t border-border bg-cream px-5 transition-[grid-template-rows] duration-200 lg:hidden",
          open ? "grid-rows-[1fr] py-3" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {PRIMARY_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-2 py-3 text-base font-medium",
                  active ? "bg-moss-light text-forest font-semibold" : "text-ink hover:bg-paper-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
