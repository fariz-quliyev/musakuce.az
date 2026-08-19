"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { authApi } from "@/lib/api/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import type { CurrentUserDto } from "@/lib/api/types";

const ROLE_LABELS: Record<string, string> = {
  Administrator: "Administrator",
  Editor: "Redaktor",
  Archivist: "Arxivçi",
  Moderator: "Moderator",
};

type NavItem = { label: string; href: string; permission?: string };
type NavGroup = { label?: string; items: NavItem[] };

/** Every item requiring a permission is hidden until we know the user
 * has it — this is UX only, the API independently re-enforces every one
 * of these server-side (see Permissions.cs / AdminAwareController).
 * Grouped per Phase 12 §4. "Sayt parametrləri" still has no distinct
 * module beyond Kəndimiz's village-profile settings — no nav link added
 * for it (would violate this project's no-dead-links rule). */
const NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/admin/dashboard" }] },
  {
    label: "Kəndimiz",
    items: [
      { label: "Kəndimiz", href: "/admin/kendimiz", permission: "villageprofile.view" },
      { label: "Tariximiz", href: "/admin/tarix", permission: "history.view" },
      { label: "İnsanlarımız", href: "/admin/insanlar", permission: "people.view" },
      { label: "Təhsil", href: "/admin/tehsil", permission: "education.view" },
      { label: "Xatirə", href: "/admin/xatire", permission: "memorial.view" },
      { label: "Mədəni irs", href: "/admin/medeni-iras", permission: "culturalheritage.view" },
      { label: "Kəndimizin səsi", href: "/admin/kendimizin-sesi", permission: "interviews.view" },
    ],
  },
  {
    label: "Kənd meydanı",
    items: [
      { label: "Elanlar", href: "/admin/elanlar", permission: "listings.view" },
      { label: "Təqvim", href: "/admin/teqvim", permission: "events.view" },
      { label: "Faydalı məlumatlar", href: "/admin/faydali-melumatlar", permission: "localinfo.view" },
      { label: "Məkanlar", href: "/admin/yerler", permission: "places.view" },
    ],
  },
  {
    label: "Media",
    items: [
      { label: "Fotoalbom", href: "/admin/fotoalbom", permission: "photos.view" },
      { label: "Videolar", href: "/admin/videolar", permission: "videos.view" },
    ],
  },
  {
    label: "Göndərişlər",
    items: [{ label: "İstifadəçi göndərişləri", href: "/admin/gonderisler", permission: "submissions.view" }],
  },
  {
    label: "Sistem",
    items: [
      { label: "İstifadəçilər", href: "/admin/users", permission: "users.manage" },
      { label: "Audit qeydiyyatı", href: "/admin/audit-log", permission: "auditlog.view" },
    ],
  },
];

/**
 * Deliberately utilitarian — dense sidebar, no display font, no photo
 * treatment — so the admin panel never reads as the public village site.
 * Still built from the same design tokens (spec Phase 6 requirement).
 *
 * Groups are collapsible; a group containing the active route is always
 * forced open (can't be collapsed away) so the current location never
 * disappears from the sidebar.
 */
function NavLinks({ groups, pathname, onNavigate }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {groups.map((group, i) => {
        const groupActive = group.items.some(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        );
        const isOpen = !group.label || groupActive || !collapsed.has(group.label);

        return (
          <div key={group.label ?? i} className="pb-3">
            {group.label ? (
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.label!)) next.delete(group.label!);
                    else next.add(group.label!);
                    return next;
                  })
                }
                aria-expanded={isOpen}
                className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase hover:bg-paper-soft hover:text-ink-soft"
              >
                {group.label}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={cn("h-3 w-3 shrink-0 transition-transform", isOpen ? "rotate-180" : "")}
                >
                  <path d="M3 4.5 6 8l3-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
            {isOpen ? (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-forest text-ink-on-dark" : "text-ink-soft hover:bg-paper-soft hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function AccountFooter({ user }: { user: CurrentUserDto | null }) {
  return (
    <div className="border-t border-stone-light px-3 py-3">
      {user ? (
        <div className="mb-1 px-3">
          <p className="truncate text-sm font-medium text-ink">{user.displayName}</p>
          <p className="text-xs text-ink-faint">{ROLE_LABELS[user.roles[0]] ?? user.roles[0]}</p>
        </div>
      ) : null}
      <LogoutButton />
      <Link href="/" className="block rounded-md px-3 py-2 text-xs font-medium text-ink-faint hover:text-ink">
        ← Sayta qayıt
      </Link>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Closes the mobile drawer whenever the route changes (e.g. after tapping
  // a nav link) — adjusted during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes,
  // so it doesn't trigger an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    authApi.me().then(setUser).catch(() => {
      // apiClient's central 401 handler already redirects to /admin/login.
    });
  }, [isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  const visibleGroups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || !user || user.permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex min-h-screen bg-paper-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-light bg-paper md:flex">
        <div className="border-b border-stone-light px-5 py-4">
          <Link href="/admin/dashboard" className="text-sm font-bold tracking-wide text-ink">
            MUSAKÜÇƏ · ADMIN
          </Link>
        </div>
        <NavLinks groups={visibleGroups} pathname={pathname} />
        <AccountFooter user={user} />
      </aside>

      {/* min-w-0: this is a flex item of the outer row flex container
          (`aside` + this column) with flex-1 — without min-w-0 a flex
          item's default min-width is its content's natural (unwrapped)
          size, so the warning banner's text below never got a chance to
          wrap on narrow screens and pushed the whole page wider than the
          viewport instead. Below md, `aside` is `hidden`, so this column
          is the row's only visible child, making its own min-width the
          entire row's floor. Desktop is unaffected — there's already
          enough room, so this constraint never actually engages there. */}
      <div className="flex min-w-0 min-h-screen flex-1 flex-col">
        {/* Mobile-only top bar — below md the sidebar is hidden entirely, so
            this is the only way to reach navigation/logout on a phone. */}
        <div className="flex items-center justify-between border-b border-stone-light bg-paper px-4 py-3 md:hidden">
          <Link href="/admin/dashboard" className="text-sm font-bold tracking-wide text-ink">
            MUSAKÜÇƏ · ADMIN
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Menyunu bağla" : "Menyunu aç"}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              {mobileNavOpen ? (
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        {mobileNavOpen ? (
          <div className="flex max-h-[70vh] flex-col overflow-y-auto border-b border-stone-light bg-paper md:hidden">
            <NavLinks groups={visibleGroups} pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            <AccountFooter user={user} />
          </div>
        ) : null}

        <div className="border-b border-warning/30 bg-warning-bg px-5 py-2 text-xs font-medium text-warning">
          🔒 Təhlükəsiz idarəetmə paneli · dəyişikliklər qeyd olunur
        </div>
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
