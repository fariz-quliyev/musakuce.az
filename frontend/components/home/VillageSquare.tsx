import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardTitle, CardMeta } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { listingsApi } from "@/lib/api/listings";
import { localInfoApi } from "@/lib/api/localInfo";
import { eventsApi } from "@/lib/api/events";
import { withFallback } from "@/lib/api/withFallback";
import { classifiedCategoryLabels, localInfoKindLabels } from "@/lib/api/labels";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { ListingDto, LocalInfoEntryDto } from "@/lib/api/types";

type EntryPoint = { label: string; href: string; icon: React.ReactNode; countLabel?: string };

/**
 * pageSize:1 just to read `totalCount` cheaply — the entry-point cards
 * show real counts ("12 aktiv elan") when the API answers, and no
 * count line at all if it doesn't (network/API failure). Never a
 * fabricated number — a real `0` is shown as-is, since an empty
 * category is real information, not a fallback.
 */
async function safeCount(fetchTotal: () => Promise<number>): Promise<number | null> {
  try {
    return await fetchTotal();
  } catch {
    return null;
  }
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};

const ENTRY_POINTS: EntryPoint[] = [
  {
    label: "Alqı-satqı",
    href: "/elanlar?category=AlqiSatqi",
    icon: (
      <svg {...iconProps}>
        <path d="M4 7l2-3h12l2 3" />
        <path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Z" />
        <path d="M9 11a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
  {
    label: "Xidmətlər",
    href: "/elanlar?category=Xidmet",
    icon: (
      <svg {...iconProps}>
        <path d="M14.7 6.3a3 3 0 0 1 4 4L9 20l-4 1 1-4Z" />
        <path d="M13 8l3 3" />
      </svg>
    ),
  },
  {
    label: "Təqvim",
    href: "/teqvim",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M4 10h16M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    label: "İtirilmiş-tapılmış",
    href: "/elanlar?category=ItirilmisTapilmis",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </svg>
    ),
  },
  {
    label: "Faydalı məlumatlar",
    href: "/faydali-melumatlar",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5.5M12 8v.01" />
      </svg>
    ),
  },
];

const FALLBACK_LISTINGS: ListingDto[] = [];
const FALLBACK_LOCAL_INFO: LocalInfoEntryDto[] = [];

/**
 * "Kəndin meydanı" — the Digital Village Square pillar's flagship
 * section. Reads real active listings and published local-info entries;
 * shows nothing in a given slot rather than inventing a fake one if the
 * API has no data yet.
 */
export async function VillageSquare() {
  const [{ data: listings }, { data: localInfo }, counts] = await Promise.all([
    withFallback(
      () => listingsApi.getPaged({ listingStatus: "Active", pageSize: 3 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
      FALLBACK_LISTINGS,
    ),
    withFallback(
      () => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 3 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
      FALLBACK_LOCAL_INFO,
    ),
    Promise.all([
      safeCount(() =>
        listingsApi
          .getPaged({ listingStatus: "Active", category: "AlqiSatqi", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.totalCount),
      ),
      safeCount(() =>
        listingsApi
          .getPaged({ listingStatus: "Active", category: "Xidmet", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.totalCount),
      ),
      safeCount(() => {
        const now = new Date();
        now.setSeconds(0, 0); // rounded so the revalidate cache above actually hits, same reasoning as ThisWeek.tsx
        return eventsApi
          .getPaged({ publicationStatus: "Published", from: now.toISOString(), pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.totalCount);
      }),
      safeCount(() =>
        listingsApi
          .getPaged({ listingStatus: "Active", category: "ItirilmisTapilmis", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.totalCount),
      ),
      safeCount(() =>
        localInfoApi
          .getPaged({ publicationStatus: "Published", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.totalCount),
      ),
    ]),
  ]);

  const [alqiSatqiCount, xidmetCount, teqvimCount, itirilmisCount, faydaliCount] = counts;

  const entryPointsWithCounts: EntryPoint[] = ENTRY_POINTS.map((entry) => {
    switch (entry.label) {
      case "Alqı-satqı":
        return { ...entry, countLabel: alqiSatqiCount !== null ? `${alqiSatqiCount} aktiv elan` : undefined };
      case "Xidmətlər":
        return { ...entry, countLabel: xidmetCount !== null ? `${xidmetCount} xidmət` : undefined };
      case "Təqvim":
        return { ...entry, countLabel: teqvimCount !== null ? `${teqvimCount} qarşıdakı tədbir` : undefined };
      case "İtirilmiş-tapılmış":
        return { ...entry, countLabel: itirilmisCount !== null ? `${itirilmisCount} elan` : undefined };
      case "Faydalı məlumatlar":
        return { ...entry, countLabel: faydaliCount !== null ? `${faydaliCount} məlumat` : undefined };
      default:
        return entry;
    }
  });

  return (
    <div className="bg-clay-light/40 py-16 sm:py-20" id="kendin-meydani">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Kənd meydanı"
            title="Kəndin meydanı"
            description="Bu sayt yalnız kənd haqqında məlumat vermir — kənd sakinləri bundan gündəlik istifadə edə bilər: elan, xidmət, tədbir və faydalı məlumat bir yerdə."
          />
          <Button href="/elanlar" variant="outline" size="sm">
            Hamısına bax
          </Button>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {entryPointsWithCounts.map((entry) => (
            <Link
              key={entry.label}
              href={entry.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-stone-light bg-paper px-3 py-4 text-center transition-colors hover:border-terracotta/60 hover:bg-cream sm:w-32"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-clay-light text-terracotta-dark">
                {entry.icon}
              </span>
              <span className="text-xs leading-tight font-semibold text-ink">{entry.label}</span>
              {entry.countLabel ? (
                <span className="text-[11px] leading-tight text-ink-faint">{entry.countLabel}</span>
              ) : null}
            </Link>
          ))}
          <Link
            href="/elanlar"
            className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-lg bg-terracotta px-3 py-4 text-center text-cream shadow-sm transition-colors hover:bg-terracotta-dark sm:w-32"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/20">
              <svg {...iconProps} stroke="currentColor">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="text-xs leading-tight font-semibold">Elan yerləşdir</span>
          </Link>
        </div>

        {listings.length === 0 && localInfo.length === 0 ? null : (
          <div className="grid gap-6 lg:grid-cols-12">
            {listings.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-3 lg:col-span-8">
                {listings.map((listing) => (
                  <Link key={listing.id} href={`/elanlar/${listing.id}`}>
                    <Card variant="square">
                      <CardMedia aspect="square">
                        <VillagePhoto
                          src={listing.imageUrls[0]}
                          alt={listing.title}
                          tone="warm"
                          placeholderLabel={classifiedCategoryLabels[listing.category]}
                          sizes="(min-width: 640px) 25vw, 50vw"
                        />
                      </CardMedia>
                      <CardBody>
                        <Badge tone={listing.category === "ItirilmisTapilmis" ? "info" : "terracotta"}>
                          {classifiedCategoryLabels[listing.category]}
                        </Badge>
                        <CardTitle className="mt-2 text-base">{listing.title}</CardTitle>
                        <CardMeta className="mt-3">
                          {listing.price ? <span className="font-semibold text-ink">{listing.price} ₼</span> : null}
                          <span>{listing.location}</span>
                        </CardMeta>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : null}

            {localInfo.length > 0 ? (
              <div className="rounded-xl border border-terracotta/20 bg-paper p-6 lg:col-span-4">
                <h3 className="font-display text-[length:var(--text-h4)] text-ink">Yerli faydalı məlumatlar</h3>
                <ul className="mt-4 space-y-4">
                  {localInfo.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start justify-between gap-3 border-b border-stone-light pb-3 last:border-0 last:pb-0"
                    >
                      <span className="truncate text-sm font-medium text-ink" title={entry.name}>
                        {entry.name}
                      </span>
                      <Badge tone="neutral" className="shrink-0">
                        {localInfoKindLabels[entry.kind]}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <Button href="/faydali-melumatlar" variant="ghost" size="sm" className="mt-5 w-full">
                  Faydalı məlumatlara bax →
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </div>
  );
}
