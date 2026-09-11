import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/home/HomeSection";
import { PlacesMapPreview } from "@/components/map/XeriteMapView";
import { placesApi } from "@/lib/api/places";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PlaceDto } from "@/lib/api/types";

const FALLBACK_PLACES: PlaceDto[] = [];

/**
 * "Musaküçə xəritədə" — heading, one line and the way onward on the left,
 * the village's real map on the right as the section's main visual: the
 * same Leaflet/OpenStreetMap map and published Place markers as /xerite,
 * in preview mode (see PlacesMap). The full map — layers, filters, the
 * per-place card with its Google Maps route link — stays on /xerite.
 *
 * Same frame as HomeSection (band, spacing, heading), but a split layout
 * instead of a heading row, so it's composed from the same primitives
 * rather than through HomeSection. The map box has a fixed height per
 * breakpoint, which also keeps the section from growing past it.
 */
export async function MapPreview() {
  const { data: places } = await withFallback(
    () => placesApi.getPaged({ publicationStatus: "Published", pageSize: 50 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PLACES,
  );

  return (
    <section className="scroll-mt-20 bg-background py-16 sm:py-20">
      <Container className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeading
            title="Musaküçə xəritədə"
            description="Kəndin tarixi və faydalı yerlərini real xəritədə tapın."
          />
          {/* The marker names as plain text: readable at a glance, and a
              text alternative to the map for screen readers. */}
          {places.length > 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              {places.map((place) => place.name).join(" · ")}
            </p>
          ) : null}
          <div className="mt-6">
            <ArrowLink href="/xerite">Xəritəni aç</ArrowLink>
          </div>
        </div>

        <PlacesMapPreview places={places} className="h-[300px] sm:h-[360px] lg:col-span-8 lg:h-[420px]" />
      </Container>
    </section>
  );
}
