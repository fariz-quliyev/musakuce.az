"use client";

import { useState } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { PersonAlbumLightbox } from "./PersonAlbumLightbox";
import type { PersonImageDto } from "@/lib/api/types";

type Props = {
  images: PersonImageDto[];
  /** Used as every thumbnail's alt text — PersonImageDto carries no
   * per-photo caption, so the person's own name is the most useful
   * generic description available (same choice HistoryTimeline's
   * EventGallery already makes for its own additional-images thumbnails,
   * using the event's title). */
  personName: string;
};

/** "Fotoalbom" section on the public person page — responsive thumbnail
 * grid, click opens PersonAlbumLightbox for a full-size view. Caller
 * (app/insanlarimiz/[id]/page.tsx) only renders this when images.length
 * > 0, so no empty-state handling is needed here. */
export function PersonPhotoAlbum({ images, personName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`${personName} — foto ${i + 1}`}
            className="aspect-square overflow-hidden rounded-lg transition-opacity hover:opacity-90"
          >
            <VillagePhoto src={image.imageUrl} alt={personName} tone="forest" sizes="(min-width: 768px) 25vw, 50vw" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <PersonAlbumLightbox
          images={images.map((image) => ({ url: image.imageUrl, alt: personName }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
