import Link from "next/link";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HomeSection } from "@/components/home/HomeSection";
import { fetchHomeGallery } from "@/lib/homeGallery";
import { cn } from "@/lib/cn";

const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 lg:grid-cols-3",
};

/**
 * "Musaküçədən görüntülər" — after Riseley's Gallery band: photos from
 * the Photo archive only, no captions or decoration. The selection and
 * its layout come from lib/homeGallery.ts (mosaic from 8 photos up, an
 * even grid below that). This section owns those photos on the
 * homepage; "Musaküçədən" above leaves them out.
 */
export async function PhotoGallery() {
  const { photos, layout } = await fetchHomeGallery();
  if (photos.length === 0) return null;

  const mosaic = layout === "mosaic";

  return (
    <HomeSection band="alt" title="Musaküçədən görüntülər" cta={{ label: "Bütün fotolara bax", href: "/fotoalbom" }}>
      <div
        className={cn(
          "grid gap-3 sm:gap-4",
          mosaic ? "grid-cols-2 lg:grid-cols-4 lg:grid-rows-2" : GRID_COLUMNS[photos.length],
        )}
      >
        {photos.map((photo, i) => {
          const lead = mosaic && i === 0;
          return (
            <Link
              key={photo.id}
              href="/fotoalbom"
              aria-label={photo.altText ?? photo.title}
              className={cn(
                "group relative block overflow-hidden rounded-lg bg-surface-tint",
                lead ? "col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto" : "aspect-[4/3]",
              )}
            >
              <VillagePhoto
                src={photo.imageUrl}
                alt={photo.altText ?? photo.title}
                tone="warm"
                placeholderLabel={photo.title}
                imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
                sizes={lead ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
              />
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
