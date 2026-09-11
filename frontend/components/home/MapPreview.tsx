import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import { placesApi } from "@/lib/api/places";
import { withFallback } from "@/lib/api/withFallback";
import { placeKindLabels } from "@/lib/api/labels";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PlaceDto } from "@/lib/api/types";

// Fixed illustration slots (not real geo-projected coordinates — the
// background is a stylized sketch, not a real map, so real Place
// lat/lng can't be projected onto it). Real published Place names fill
// these slots in whatever order the API returns them; unused slots are
// simply dropped rather than padded with invented names.
const PIN_SLOTS = [
  { x: 30, y: 40 },
  { x: 60, y: 26 },
  { x: 44, y: 70 },
  { x: 76, y: 56 },
  { x: 16, y: 72 },
];

const FALLBACK_PLACES: PlaceDto[] = [];

const pinPath = "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z";

/**
 * "Musaküçə xəritədə" — a small, static illustrated preview beside the
 * list of main places it marks; the real interactive Leaflet map lives
 * at /xerite. Kept to a bounded 16:9 panel so the map never takes over
 * the homepage.
 */
export async function MapPreview() {
  const { data: places } = await withFallback(
    () => placesApi.getPaged({ publicationStatus: "Published", pageSize: PIN_SLOTS.length }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PLACES,
  );

  const pins = places.slice(0, PIN_SLOTS.length).map((place, i) => ({ ...PIN_SLOTS[i], place }));

  return (
    <HomeSection title="Musaküçə xəritədə" cta={{ label: "Xəritəni aç", href: "/xerite" }}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Link
          href="/xerite"
          aria-label="Musaküçə xəritəsini aç"
          className="relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-tint lg:col-span-2"
        >
          <svg aria-hidden viewBox="0 0 160 90" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-primary-light">
            <path d="M0 58 Q 40 46 80 55 T 160 48" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M64 0 Q 72 40 67 90" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M0 22 Q 60 10 110 24 T 160 16" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>

          {/* Always-present village-centre marker, independent of
              published Place data, so the sketch reads as Musaküçə's
              map even before any Place records exist. */}
          <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: "50%", top: "48%" }}>
            <div className="flex flex-col items-center">
              <span className="mb-1 rounded-md bg-primary px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-text-on-primary">
                Musaküçə
              </span>
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary">
                <path fill="currentColor" d={pinPath} />
                <circle cx="12" cy="10" r="3.4" style={{ fill: "var(--color-surface)" }} />
              </svg>
            </div>
          </div>

          {pins.map((pin) => (
            <div
              key={pin.place.id}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="mb-1 hidden rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-text sm:block">
                  {pin.place.name}
                </span>
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-dark">
                  <path fill="currentColor" d={pinPath} />
                  <circle cx="12" cy="10" r="3" style={{ fill: "var(--color-surface)" }} />
                </svg>
              </div>
            </div>
          ))}
        </Link>

        {places.length > 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold text-text">Xəritədəki əsas yerlər</h3>
            <ul className="mt-4 divide-y divide-border">
              {places.map((place) => (
                <li key={place.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-text">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary">
                      <path fill="currentColor" d={pinPath} />
                    </svg>
                    <span className="truncate">{place.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">{placeKindLabels[place.kind]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-text-muted lg:self-center">
            Kəndin tarixi və faydalı məkanlarını interaktiv xəritədə tapın.
          </p>
        )}
      </div>
    </HomeSection>
  );
}
