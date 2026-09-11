import Link from "next/link";
import { Container } from "@/components/ui/Container";

// Grouped the way the site is organised (see PRIMARY_NAV in Navbar.tsx):
// every page appears under the header section it belongs to, so nothing
// here is a stray link — Mədəni irs under Kəndimiz, Xatirə and
// Kəndimizin səsi under Tarix və yaddaş, Videolar beside Fotoalbom.
const COLUMNS = [
  {
    title: "Kəndimiz",
    links: [
      { label: "Kəndimiz", href: "/kendimiz" },
      { label: "Mədəni irs", href: "/medeniyyet" },
      { label: "Təhsil", href: "/tehsil" },
      { label: "Xəritə", href: "/xerite" },
    ],
  },
  {
    title: "Tarix və yaddaş",
    links: [
      { label: "Tariximiz", href: "/tariximiz" },
      { label: "Xatirə", href: "/xatire" },
      { label: "Kəndimizin səsi", href: "/kendimizin-sesi" },
      { label: "İnsanlarımız", href: "/insanlarimiz" },
    ],
  },
  {
    title: "Foto və video",
    links: [
      { label: "Fotoalbom", href: "/fotoalbom" },
      { label: "Videolar", href: "/videolar" },
    ],
  },
  {
    title: "Kənd həyatı",
    links: [
      { label: "Kəndimizdən", href: "/kendimizden" },
      { label: "Elanlar", href: "/elanlar" },
      { label: "Təqvim", href: "/teqvim" },
      { label: "Faydalı məlumatlar", href: "/faydali-melumatlar" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-light bg-cream-deep">
      {/* Brand + contact (2 columns) + four link columns = 6 on desktop;
          on phones the brand spans the width and the four link groups sit
          two by two, instead of five blocks stacked one per row. */}
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-6">
        <div className="col-span-2">
          <p className="font-display text-xl font-semibold text-forest">
            MUSAKÜÇƏ.AZ
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Kəndimizin rəqəmsal yaddaşı və gündəlik həyatı — bir yerdə.
          </p>
          {/* Social media links have a reserved spot here for when real
              village-run accounts exist — intentionally not stubbed with
              placeholder icons/links until then. */}
          <ul className="mt-5 space-y-1.5 text-sm text-ink-soft">
            <li>musakuce@musakuce.az</li>
            <li>Musaküçə, Masallı, Azərbaycan</li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title}>
            <h3 className="mb-2.5 text-sm font-semibold text-ink">
              {col.title}
            </h3>
            {/* Below sm each link is a 44px-tall row (the tap-target
                minimum); from sm up the list keeps its compact spacing. */}
            <ul className="sm:space-y-1.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-sm text-ink-soft transition-colors hover:text-forest sm:inline sm:min-h-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-stone-light">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Musaküçə.az — kəndimizin rəqəmsal evi.</p>
          <div className="flex items-center gap-4">
            <p>Tarixi məlumatların mənbələri hər səhifədə ayrıca qeyd olunur.</p>
            <Link
              href="/mexfilik-siyaseti"
              className="inline-flex min-h-11 shrink-0 items-center hover:text-forest hover:underline sm:min-h-0"
            >
              Məxfilik siyasəti
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
