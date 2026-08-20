"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { localInfoApi } from "@/lib/api/localInfo";
import { localInfoKindLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { LocalInfoEntryDto, LocalInfoKind, PagedResult } from "@/lib/api/types";

const PAGE_SIZE = 24;

const KIND_TABS: { value: LocalInfoKind | ""; label: string }[] = [
  { value: "", label: "Hamısı" },
  { value: "Service", label: localInfoKindLabels.Service },
  { value: "Contact", label: localInfoKindLabels.Contact },
  { value: "Shop", label: localInfoKindLabels.Shop },
  { value: "Craftsman", label: localInfoKindLabels.Craftsman },
  { value: "Transport", label: localInfoKindLabels.Transport },
  { value: "Recommendation", label: localInfoKindLabels.Recommendation },
];

type Props = {
  initialData: PagedResult<LocalInfoEntryDto>;
  initialIsLive: boolean;
  initialKind?: LocalInfoKind;
};

/** Owns kind filtering + pagination for /faydali-melumatlar — same
 * "server page 1, client after" pattern as the other Browser
 * components; the initial kind still honours the ?kind= URL param a
 * shared link may carry, exactly as the page's first render always did. */
export function LocalInfoBrowser({ initialData, initialIsLive, initialKind }: Props) {
  const [kind, setKind] = useState<LocalInfoKind | "">(initialKind ?? "");
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
    localInfoApi
      .getPaged({ publicationStatus: "Published", kind: kind || undefined, pageSize: PAGE_SIZE, page })
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
  }, [kind, page]);

  function retry() {
    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    localInfoApi
      .getPaged({ publicationStatus: "Published", kind: kind || undefined, pageSize: PAGE_SIZE, page })
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
      <div className="mb-8 flex flex-wrap gap-2">
        {KIND_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setKind(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              kind === tab.value
                ? "border-forest bg-forest text-cream"
                : "border-stone-light bg-paper text-ink-soft hover:border-forest hover:text-forest",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataSourceNote isLive={isLive} />

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Məlumatları yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState
          title="Bu kateqoriyada məlumat yoxdur"
          description="Başqa kateqoriya seçin və ya daha sonra yenidən yoxlayın."
        />
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-stone-light bg-paper p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate font-display text-base text-ink" title={entry.name}>
                    {entry.name}
                  </h3>
                  <Badge tone="neutral" className="shrink-0">
                    {localInfoKindLabels[entry.kind]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">{entry.category}</p>
                {entry.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{entry.description}</p>
                ) : null}
                {entry.contactInfo ? (
                  <p className="mt-3 text-sm font-medium text-forest">{entry.contactInfo}</p>
                ) : null}
                {entry.areaServed ? (
                  <p className="mt-1 text-xs text-ink-faint">{entry.areaServed}</p>
                ) : null}
                <div className="mt-3">
                  <SuggestionCta targetEntityType="LocalInfoEntry" targetEntityId={entry.id} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
