"use client";

import { useEffect, useRef, useState } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { videosApi } from "@/lib/api/videos";
import type { PagedResult, VideoDto } from "@/lib/api/types";

const PAGE_SIZE = 18;

type Props = {
  initialData: PagedResult<VideoDto>;
  initialIsLive: boolean;
};

/** Owns pagination for /videolar — same "server page 1, client pages
 * after" pattern as the other Browser components. */
export function VideosBrowser({ initialData, initialIsLive }: Props) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initialData);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const isFirstRender = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    videosApi
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
    videosApi
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
          title="Videoları yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState title="Hələ video əlavə edilməyib" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((video) => {
              const isPlayable = video.embedUrlOrKey.startsWith("http");
              const Wrapper = isPlayable ? "a" : "div";
              return (
                <Wrapper
                  key={video.id}
                  {...(isPlayable ? { href: video.embedUrlOrKey, target: "_blank", rel: "noreferrer" } : {})}
                  className="group block"
                >
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <VillagePhoto
                      src={video.thumbnailUrl ?? undefined}
                      alt={video.title}
                      tone="warm"
                      placeholderLabel={video.title}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 font-medium text-ink">{video.title}</p>
                  {video.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{video.description}</p>
                  ) : null}
                  {video.category ? (
                    <Badge tone="neutral" className="mt-2">
                      {video.category}
                    </Badge>
                  ) : null}
                </Wrapper>
              );
            })}
          </div>
          <div className="mt-10">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
