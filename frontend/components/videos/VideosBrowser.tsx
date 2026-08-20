"use client";

import { useEffect, useRef, useState } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { videosApi } from "@/lib/api/videos";
import type { PagedResult, VideoDto } from "@/lib/api/types";

const PAGE_SIZE = 18;

/**
 * `embedUrlOrKey` is free text in the admin form — some entries are a
 * full URL, others (YouTube/Vimeo especially) are just the bare video
 * ID. A full URL is always used as-is, unchanged. For YouTube/Vimeo, a
 * bare key is expanded into a real playable URL using each provider's
 * well-known, stable link format. SelfHosted has no such known pattern
 * in this data model (no base-URL field exists), so a bare key there
 * genuinely can't be turned into a safe link — returns null rather than
 * guessing one.
 */
function resolvePlayableUrl(video: VideoDto): string | null {
  const value = video.embedUrlOrKey.trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  if (video.embedProvider === "YouTube") return `https://www.youtube.com/watch?v=${value}`;
  if (video.embedProvider === "Vimeo") return `https://vimeo.com/${value}`;
  return null;
}

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
              const playableUrl = resolvePlayableUrl(video);
              const Wrapper = playableUrl ? "a" : "div";
              return (
                // SuggestionCta below is deliberately a sibling outside
                // Wrapper, not nested inside it — Wrapper is an <a> when
                // the video is playable, and a button/link inside
                // another link is both invalid HTML and would trigger
                // the outer navigation on click.
                <div key={video.id}>
                  <Wrapper
                    {...(playableUrl ? { href: playableUrl, target: "_blank", rel: "noreferrer" } : {})}
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
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {video.category ? <Badge tone="neutral">{video.category}</Badge> : null}
                      {!playableUrl ? <Badge tone="neutral">İzləmə keçidi yoxdur</Badge> : null}
                    </div>
                  </Wrapper>
                  <div className="mt-2">
                    <SuggestionCta targetEntityType="Video" targetEntityId={video.id} />
                  </div>
                </div>
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
