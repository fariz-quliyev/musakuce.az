import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PhotoDto } from "@/lib/api/types";

/** From this many published photos up, the homepage gallery switches
 * from an even grid to the one-large-plus-four mosaic. */
export const GALLERY_MOSAIC_MIN = 8;

/** The most photos the gallery ever shows (the 3×2 grid). */
export const GALLERY_MAX_PHOTOS = 6;

export type HomeGallery = {
  photos: PhotoDto[];
  layout: "mosaic" | "grid";
  isLive: boolean;
};

/**
 * The homepage gallery's selection — newest published photos straight
 * from the Photo archive, nothing else mixed in. Sizes are chosen so the
 * layout never leaves an empty cell: 8+ photos → mosaic of 5; 6–7 → 6
 * (3×2); 4–5 → 4; fewer → all of them.
 *
 * Exported separately from the component because "Musaküçədən" reads
 * the same selection to leave these photos out, so no picture appears in
 * both sections. Both calls issue the identical request, which Next's
 * fetch memoization collapses into one.
 */
export async function fetchHomeGallery(): Promise<HomeGallery> {
  const { data: photos, isLive } = await withFallback(
    () =>
      photosApi
        .getPaged({ publicationStatus: "Published", pageSize: GALLERY_MOSAIC_MIN }, HOMEPAGE_REVALIDATE_SECONDS)
        .then((r) => r.items),
    [] as PhotoDto[],
  );

  const n = photos.length;
  if (n >= GALLERY_MOSAIC_MIN) return { photos: photos.slice(0, 5), layout: "mosaic", isLive };
  const count = n >= GALLERY_MAX_PHOTOS ? GALLERY_MAX_PHOTOS : n >= 4 ? 4 : n;
  return { photos: photos.slice(0, count), layout: "grid", isLive };
}
