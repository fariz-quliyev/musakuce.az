import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { placesApi } from "@/lib/api/places";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PlaceDto } from "@/lib/api/types";

// Fixed illustration slots (not real geo-projected coordinates — the
// background is a stylized sketch, not a real map, so real Place
// lat/lng can't be projected onto it). Real published Place names fill
// these slots in whatever order the API returns them; unused slots are
// simply dropped rather than padded with invented names.
const PIN_SLOTS = [
  { x: 32, y: 38 },
  { x: 58, y: 24 },
  { x: 46, y: 60 },
  { x: 74, y: 52 },
  { x: 20, y: 66 },
];

const FALLBACK_PLACES: PlaceDto[] = [];

/**
 * Static, illustrated map preview — not a wired Leaflet instance (the
 * real interactive map lives at /xerite, Phase 11). Pin labels come from
 * real published Places; the background illustration itself stays
 * hand-drawn/stylized, matching the site's earth-tone palette.
 */
export async function MapPreview() {
  const { data: places } = await withFallback(
    () => placesApi.getPaged({ publicationStatus: "Published", pageSize: 5 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PLACES,
  );

  const pins = places.slice(0, PIN_SLOTS.length).map((place, i) => ({ ...PIN_SLOTS[i], label: place.name }));

  return (
    <Container as="section" className="py-16 sm:py-20">
      <div className="grid items-center gap-10 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <SectionHeading
            eyebrow="Xəritə"
            title="Musaküçə xəritədə"
            description="Mühüm yerləri və faydalı məkanları xəritədə tapın."
          />
          <Button href="/xerite" variant="secondary" className="mt-6">
            Xəritəyə bax
          </Button>
        </div>

        <div className="sm:col-span-7">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-stone-light bg-moss-light shadow-md">
            <svg aria-hidden viewBox="0 0 100 75" className="absolute inset-0 h-full w-full text-forest-light/50">
              <path d="M0 50 Q 25 40 50 48 T 100 42" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <path d="M40 0 Q 45 35 42 75" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M0 20 Q 40 10 70 22 T 100 15" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
            </svg>

            {/* Always-present village-center marker, independent of
                published Place data — anchors the illustration as
                specifically Musaküçə's map rather than a generic
                decorative sketch, even before any Place records exist. */}
            <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: "50%", top: "46%" }}>
              <div className="flex flex-col items-center">
                <span className="mb-1 rounded-full bg-forest px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-ink-on-dark shadow-sm">
                  Musaküçə
                </span>
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-forest drop-shadow">
                  <path fill="currentColor" d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z" />
                  <circle cx="12" cy="10" r="3.4" fill="var(--color-cream)" />
                </svg>
              </div>
            </div>

            {pins.map((pin) => (
              <div key={pin.label} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                <div className="flex flex-col items-center">
                  <span className="mb-1 rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-ink shadow-sm">
                    {pin.label}
                  </span>
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-terracotta drop-shadow">
                    <path fill="currentColor" d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z" />
                    <circle cx="12" cy="10" r="3" fill="var(--color-cream)" />
                  </svg>
                </div>
              </div>
            ))}

            {places.length > 0 ? (
              <span className="absolute top-3 right-3 rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-sm">
                Xəritədə {places.length} məkan
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
