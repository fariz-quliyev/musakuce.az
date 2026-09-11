import { HomeSection } from "@/components/home/HomeSection";
import { HomeLinkCard, linkCardIconProps as icon } from "@/components/home/HomeLinkCard";

const DIRECTIONS = [
  {
    title: "Elanlar",
    href: "/elanlar",
    description: "Alqı-satqı, xidmət və kənd elanları — öz elanınızı da yerləşdirin.",
    icon: (
      <svg {...icon}>
        <path d="M4 7l2-3h12l2 3" />
        <path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Z" />
        <path d="M9 11a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
  {
    title: "Tədbirlər",
    href: "/teqvim",
    description: "Kənddə keçiriləcək görüşlər, tədbirlər və mərasimlər.",
    icon: (
      <svg {...icon}>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M4 10h16M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    title: "Faydalı məlumatlar",
    href: "/faydali-melumatlar",
    description: "Xidmətlər, ustalar, mağazalar, nəqliyyat və faydalı əlaqələr.",
    icon: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5.5M12 8v.01" />
      </svg>
    ),
  },
  {
    title: "İtirilmiş-tapılmış",
    href: "/elanlar?category=ItirilmisTapilmis",
    description: "İtirdiyiniz və ya tapdığınız əşyalar barədə elanlar.",
    icon: (
      <svg {...icon}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </svg>
    ),
  },
];

/**
 * "Kənd həyatı" — the Village Square pillar on the homepage, reduced to
 * four signposts (same card as "Musaküçə haqqında") plus one link onward.
 * No counters: the homepage points the way, the pages hold the numbers.
 * The board itself — browsing, filtering and posting listings — lives at
 * /elanlar; events at /teqvim; local info at /faydali-melumatlar. Keeps
 * the `kendin-meydani` anchor.
 */
export function VillageSquare() {
  return (
    <HomeSection
      id="kendin-meydani"
      title="Kənd həyatı"
      description="Elan, tədbir və faydalı məlumat — kəndin gündəlik həyatı bir yerdə."
      cta={{ label: "Kənd meydanına keç", href: "/elanlar" }}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DIRECTIONS.map(({ title, href, description, icon: glyph }) => (
          <HomeLinkCard key={href} href={href} icon={glyph} title={title} description={description} />
        ))}
      </div>
    </HomeSection>
  );
}
