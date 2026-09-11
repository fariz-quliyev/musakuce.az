import { HomeSection } from "@/components/home/HomeSection";
import { HomeLinkCard, linkCardIconProps as icon } from "@/components/home/HomeLinkCard";
import { listingsApi } from "@/lib/api/listings";
import { localInfoApi } from "@/lib/api/localInfo";
import { eventsApi } from "@/lib/api/events";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * pageSize:1 just to read `totalCount` cheaply — each card shows a real
 * count ("12 aktiv elan") when the API answers and no count at all if it
 * doesn't. Never a fabricated number: a real `0` is shown as-is.
 */
async function safeCount(fetchTotal: () => Promise<number>): Promise<number | null> {
  try {
    return await fetchTotal();
  } catch {
    return null;
  }
}

/**
 * "Kənd həyatı" — the Village Square pillar on the homepage, reduced to
 * four signposts (same card as "Musaküçə haqqında") plus one link onward.
 * The board itself — browsing, filtering and posting listings — lives at
 * /elanlar; events at /teqvim; local info at /faydali-melumatlar. Keeps
 * the `kendin-meydani` anchor.
 */
export async function VillageSquare() {
  // Rounded to the minute so the revalidate cache actually hits.
  const now = new Date();
  now.setSeconds(0, 0);

  const [listingsCount, eventsCount, localInfoCount, lostFoundCount] = await Promise.all([
    safeCount(() =>
      listingsApi.getPaged({ listingStatus: "Active", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.totalCount),
    ),
    safeCount(() =>
      eventsApi
        .getPaged({ publicationStatus: "Published", from: now.toISOString(), pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
        .then((r) => r.totalCount),
    ),
    safeCount(() =>
      localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.totalCount),
    ),
    safeCount(() =>
      listingsApi
        .getPaged({ listingStatus: "Active", category: "ItirilmisTapilmis", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
        .then((r) => r.totalCount),
    ),
  ]);

  const count = (n: number | null, noun: string) => (n === null ? undefined : `${n} ${noun}`);

  const directions = [
    {
      title: "Elanlar",
      href: "/elanlar",
      description: "Alqı-satqı, xidmət və kənd elanları — öz elanınızı da yerləşdirin.",
      meta: count(listingsCount, "aktiv elan"),
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
      meta: count(eventsCount, "qarşıdakı tədbir"),
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
      meta: count(localInfoCount, "məlumat"),
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
      meta: count(lostFoundCount, "elan"),
      icon: (
        <svg {...icon}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <HomeSection
      id="kendin-meydani"
      title="Kənd həyatı"
      description="Elan, tədbir və faydalı məlumat — kəndin gündəlik həyatı bir yerdə."
      cta={{ label: "Kənd meydanına keç", href: "/elanlar" }}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {directions.map(({ title, href, description, meta, icon: glyph }) => (
          <HomeLinkCard key={href} href={href} icon={glyph} title={title} description={description} meta={meta} />
        ))}
      </div>
    </HomeSection>
  );
}
