"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { historyApi } from "@/lib/api/history";
import { sourceStatusLabels } from "@/lib/api/labels";
import type { HistoricalEventDto, PagedResult } from "@/lib/api/types";

const PAGE_SIZE = 20;

// Seeded placeholder events (HistoricalEventDto.isDefault) carry an
// admin-facing "this is sample content" notice in their Description —
// never shown verbatim to a public visitor; the admin list flags these
// rows with a "Nümunə" badge instead (see HistoryTable.tsx).
const DEFAULT_EVENT_NOTICE = "Bu hadisə haqqında məlumat hazırlanır — tezliklə əlavə olunacaq.";

type Props = {
  initialData: PagedResult<HistoricalEventDto>;
  initialIsLive: boolean;
};

/** Owns pagination for /tariximiz — same "server page 1, client pages
 * after" pattern as the other Browser components. */
export function HistoryBrowser({ initialData, initialIsLive }: Props) {
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
    historyApi
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
    historyApi
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
          title="Tarixçəni yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="space-y-8 border-l border-stone-light pl-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full max-w-2xl" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState title="Hələ tarixi məlumat əlavə edilməyib" />
      ) : (
        <>
          <ol className="relative space-y-8 border-l border-stone-light pl-8">
            {result.items.map((event) => (
              <li key={event.id} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[calc(2rem+2.5px)] h-2.5 w-2.5 rounded-full bg-terracotta"
                />
                <p className="font-display text-xl text-forest">{event.period}</p>
                <h3 className="mt-1 font-display text-lg text-ink">{event.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {event.isDefault ? DEFAULT_EVENT_NOTICE : event.description}
                </p>
                <Badge tone="terracotta" className="mt-2">
                  {sourceStatusLabels[event.sourceStatus]}
                </Badge>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
