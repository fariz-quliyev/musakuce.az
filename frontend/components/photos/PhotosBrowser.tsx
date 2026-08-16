"use client";

import { useEffect, useRef, useState } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { PhotoLightbox } from "./PhotoLightbox";
import { photosApi } from "@/lib/api/photos";
import { photoCategoryLabels } from "@/lib/api/labels";
import type { PagedResult, PhotoDto } from "@/lib/api/types";

const PAGE_SIZE = 24;

type Props = {
  initialData: PagedResult<PhotoDto>;
  initialIsLive: boolean;
};

/**
 * Owns pagination and the lightbox for /fotoalbom. Same "server page 1,
 * client pages after" pattern as ListingsBrowser/PeopleBrowser — paging
 * closes any open lightbox rather than trying to carry it across a
 * newly-fetched result set.
 */
export function PhotosBrowser({ initialData, initialIsLive }: Props) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initialData);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isFirstRender = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    setLightboxIndex(null);
    photosApi
      .getPaged({ publicationStatus: "Published", pageSize: PAGE_SIZE, page })
      .then((data) => {
        if (requestIdRef.current !== thisRequestId) return;
        setResult(data);
        setIsLive(true);
        setStatus("idle");
      })
      .catch(() => {
        if (requestIdRef.current !== thisRequestId) return;
        setStatus("error");
      });
  }, [page]);

  function retry() {
    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    photosApi
      .getPaged({ publicationStatus: "Published", pageSize: PAGE_SIZE, page })
      .then((data) => {
        if (requestIdRef.current !== thisRequestId) return;
        setResult(data);
        setIsLive(true);
        setStatus("idle");
      })
      .catch(() => {
        if (requestIdRef.current !== thisRequestId) return;
        setStatus("error");
      });
  }

  return (
    <div>
      <DataSourceNote isLive={isLive} />

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Fotoları yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState title="Hələ foto əlavə edilməyib" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {result.items.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`${photo.title} — böyüt`}
                className="group text-left"
              >
                <div className="aspect-square overflow-hidden rounded-lg">
                  <VillagePhoto
                    src={photo.imageUrl || undefined}
                    alt={photo.title}
                    tone="warm"
                    placeholderLabel={photo.title}
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-2 truncate text-sm font-medium text-ink">{photo.title}</p>
                <Badge tone="neutral" className="mt-1">
                  {photoCategoryLabels[photo.category]}
                </Badge>
              </button>
            ))}
          </div>
          <div className="mt-10">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {lightboxIndex !== null ? (
        <PhotoLightbox
          photos={result.items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
