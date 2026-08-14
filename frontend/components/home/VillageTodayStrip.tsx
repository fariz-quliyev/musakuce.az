import { Container } from "@/components/ui/Container";
import { listingsApi } from "@/lib/api/listings";
import { eventsApi } from "@/lib/api/events";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

const AZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

function formatToday() {
  const now = new Date();
  return `${now.getDate()} ${AZ_MONTHS[now.getMonth()]}`;
}

const iconProps = {
  viewBox: "0 0 20 20",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4",
};

/**
 * "Kənd bu gün" — a slim, friendly utility line (date, weather slot, and
 * a few live counts). Counts come from the real Listings/Events/Photos
 * APIs (each queried with pageSize:1 just to read totalCount cheaply) —
 * labeled as running totals rather than "today"/"this week" claims the
 * API can't actually back up.
 */
export async function VillageTodayStrip() {
  const [{ data: listingsTotal }, { data: eventsTotal }, { data: photosTotal }] = await Promise.all([
    withFallback(
      () => listingsApi.getPaged({ listingStatus: "Active", pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.totalCount),
      3,
    ),
    withFallback(() => eventsApi.getPaged({ pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.totalCount), 5),
    withFallback(() => photosApi.getPaged({ pageSize: 1 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.totalCount), 5),
  ]);

  const items = [
    {
      icon: (
        <svg {...iconProps}>
          <rect x="3" y="4" width="14" height="13" rx="1.5" />
          <path d="M3 8h14M7 2.5v3M13 2.5v3" />
        </svg>
      ),
      label: formatToday(),
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M5.5 12.5a3.5 3.5 0 0 1 .6-6.95 4.5 4.5 0 0 1 8.6 1.2A3 3 0 0 1 14 12.5H5.5Z" />
        </svg>
      ),
      label: "Hava — tezliklə",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M4 6l1.5-2.5h9L16 6" />
          <path d="M4 6h12v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z" />
        </svg>
      ),
      label: `${listingsTotal} aktiv elan`,
    },
    {
      icon: (
        <svg {...iconProps}>
          <rect x="3" y="4" width="14" height="13" rx="1.5" />
          <path d="M3 8h14" />
        </svg>
      ),
      label: `${eventsTotal} tədbir`,
    },
    {
      icon: (
        <svg {...iconProps}>
          <rect x="2.5" y="5.5" width="15" height="11" rx="1.5" />
          <circle cx="10" cy="11" r="3" />
          <path d="M7 5.5l1-2h4l1 2" />
        </svg>
      ),
      label: `${photosTotal} foto arxivdə`,
    },
  ];

  return (
    <div className="border-b border-stone-light bg-paper-soft">
      <Container className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-xs font-medium text-ink-soft sm:justify-start">
        <span className="font-display text-sm text-forest">Kənd bu gün</span>
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden className="text-forest-light">
              {item.icon}
            </span>
            {item.label}
          </span>
        ))}
      </Container>
    </div>
  );
}
