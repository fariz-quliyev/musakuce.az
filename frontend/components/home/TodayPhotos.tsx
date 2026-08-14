import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { sourceStatusLabels } from "@/lib/api/labels";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PhotoDto } from "@/lib/api/types";

const FALLBACK_PHOTOS: PhotoDto[] = [];

/**
 * Photography is a core identity feature, not a supporting gallery: a
 * large "Bir foto — bir hekayə" story (the most recent published photo
 * that has a Story written for it) leads the section, followed by the
 * next most recent photos in a collage.
 */
export async function TodayPhotos() {
  const { data: photos } = await withFallback(
    () => photosApi.getPaged({ publicationStatus: "Published", pageSize: 8 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PHOTOS,
  );

  if (photos.length === 0) return null;

  const storyIndex = photos.findIndex((p) => p.story);
  const featuredStory = photos[storyIndex === -1 ? 0 : storyIndex];
  const rest = photos.filter((p) => p.id !== featuredStory.id).slice(0, 5);

  return (
    <Container as="section" className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Fotoarxiv"
        title="Bu gün Musaküçə"
        description="Kəndin bugünkü mənzərələri və bir şəkil, bir hekayə."
        className="mb-10"
      />

      <div className="mb-8 grid gap-0 overflow-hidden rounded-xl border border-stone-light bg-paper shadow-md sm:grid-cols-2">
        <div className="aspect-[4/3] sm:aspect-auto">
          <VillagePhoto
            src={featuredStory.imageUrl}
            alt={featuredStory.altText ?? featuredStory.title}
            tone="warm"
            placeholderLabel="Bir foto — bir hekayə"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <Badge tone="gold" className="w-fit">
            Bir foto — bir hekayə
          </Badge>
          <h3 className="mt-4 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-ink">
            {featuredStory.title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">
            {featuredStory.story ?? featuredStory.description}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-ink-faint">
            {featuredStory.takenDate ? <span>{featuredStory.takenDate}</span> : null}
            <Badge tone="terracotta">{sourceStatusLabels[featuredStory.sourceStatus]}</Badge>
          </div>
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {rest.map((photo) => (
            <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
              <VillagePhoto
                src={photo.imageUrl}
                alt={photo.altText ?? photo.title}
                tone="warm"
                placeholderLabel={photo.title}
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 text-center">
        <Button href="/fotoalbom" variant="outline">
          Fotoalboma bax
        </Button>
      </div>
    </Container>
  );
}
