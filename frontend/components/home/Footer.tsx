import Link from "next/link";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Kəşf et",
    links: [
      { label: "Kəndimiz", href: "/kendimiz" },
      { label: "Tariximiz", href: "/tariximiz" },
      { label: "İnsanlarımız", href: "/insanlarimiz" },
      { label: "Təhsil", href: "/tehsil" },
      { label: "Fotoalbom", href: "/fotoalbom" },
    ],
  },
  {
    title: "Kənd meydanı",
    links: [
      { label: "Elanlar", href: "/elanlar" },
      { label: "Təqvim", href: "/teqvim" },
      { label: "Faydalı məlumatlar", href: "/faydali-melumatlar" },
    ],
  },
  {
    title: "Arxiv",
    links: [
      { label: "Videolar", href: "/videolar" },
      { label: "Kəndimizin səsi", href: "/kendimizin-sesi" },
      { label: "Xatirə", href: "/xatire" },
      { label: "Mədəni irs", href: "/medeniyyet" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-light bg-cream-deep">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-semibold text-forest">
            Musaküçə
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Kəndimizin rəqəmsal yaddaşı və gündəlik həyatı — bir yerdə.
          </p>
          {/* Social media links have a reserved spot here for when real
              village-run accounts exist — intentionally not stubbed with
              placeholder icons/links until then. */}
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title}>
            <h3 className="mb-2.5 text-sm font-semibold text-ink">
              {col.title}
            </h3>
            <ul className="space-y-1.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink">Əlaqə</h3>
          <ul className="space-y-1.5 text-sm text-ink-soft">
            <li>musakuce@musakuce.az</li>
            <li>Musaküçə, Masallı, Azərbaycan</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-stone-light">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Musaküçə.az — kəndimizin rəqəmsal evi.</p>
          <p>Tarixi məlumatların mənbələri hər səhifədə ayrıca qeyd olunur.</p>
        </Container>
      </div>
    </footer>
  );
}
