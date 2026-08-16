"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewDto, PagedResult } from "@/lib/api/types";

const PAGE_SIZE = 12;

type Props = {
  initialData: PagedResult<InterviewDto>;
  initialIsLive: boolean;
};

/** Owns pagination for /kendimizin-sesi — same "server page 1, client
 * pages after" pattern as the other Browser components. */
export function InterviewsBrowser({ initialData, initialIsLive }: Props) {
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
    interviewsApi
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
    interviewsApi
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
          title="Müsahibələri yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState title="Kəndimizin səsi arxivinə hələ müsahibə əlavə edilməyib." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            {result.items.map((interview) => (
              <Link key={interview.id} href={`/kendimizin-sesi/${interview.id}`} className="group relative overflow-hidden rounded-xl">
                <div className="aspect-[4/3]">
                  <VillagePhoto
                    src={interview.thumbnailImageUrl ?? undefined}
                    alt={interview.personName}
                    tone="forest"
                    placeholderLabel={interview.personName}
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div
                  aria-hidden
                  className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-md transition-transform group-hover:scale-105"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="ml-0.5 h-6 w-6 text-forest">
                    <path d="M6 4.5v11l9-5.5-9-5.5Z" />
                  </svg>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <Badge tone="gold" className="mb-2">
                    Müsahibə
                  </Badge>
                  <p className="font-display text-lg text-cream">{interview.personName}</p>
                  {interview.title ? <p className="text-sm text-cream/80">{interview.title}</p> : null}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
