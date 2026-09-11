import Link from "next/link";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HomeSection } from "@/components/home/HomeSection";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { fetchVillageUpdates, HOME_NEWS_COUNT } from "@/lib/villageUpdates";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import { cn } from "@/lib/cn";
import type { PhotoDto } from "@/lib/api/types";

const FALLBACK_PHOTOS: PhotoDto[] = [];
const SHOWN = 5;

/**
 * "Musaküçədən görüntülər" — after Riseley's Gallery band: photos only,
 * no captions or decoration. Five or more photos form a mosaic (one
 * large + four small); fewer fall back to an even grid so the layout
 * never shows empty cells.
 *
 * Photos already shown in "Son xəbərlər" just above are left out, so the
 * gallery only shows pictures the visitor hasn't seen yet. The one
 * exception: when every published photo is already in the news row (a
 * young archive), the gallery shows them anyway rather than vanishing.
 */
export async function PhotoGallery() {
  const [{ data: photos }, shownInNews] = await Promise.all([
    withFallback(
      () =>
        photosApi
          .getPaged({ publicationStatus: "Published", pageSize: SHOWN + HOME_NEWS_COUNT }, HOMEPAGE_REVALIDATE_SECONDS)
          .then((r) => r.items),
      FALLBACK_PHOTOS,
    ),
    fetchVillageUpdates(HOME_NEWS_COUNT, HOMEPAGE_REVALIDATE_SECONDS)
      .then((updates) => new Set(updates.slice(0, HOME_NEWS_COUNT).map((u) => u.sourceId)))
      .catch(() => new Set<string | undefined>()),
  ]);

  const unseen = photos.filter((p) => !shownInNews.has(p.id));
  const shown = (unseen.length > 0 ? unseen : photos).slice(0, SHOWN);
  if (shown.length === 0) return null;

  const mosaic = shown.length >= SHOWN;

  return (
    <HomeSection band="alt" title="Musaküçədən görüntülər" cta={{ label: "Bütün fotolara bax", href: "/fotoalbom" }}>
      <div
        className={cn(
          "grid gap-3 sm:gap-4",
          mosaic
            ? "grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
            : shown.length === 1
              ? "grid-cols-1"
              : shown.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {shown.map((photo, i) => {
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
                sizes={lead ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"}
              />
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
