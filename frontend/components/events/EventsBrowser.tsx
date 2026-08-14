"use client";

import { useEffect, useRef, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { EventCard } from "./EventCard";
import { eventsApi } from "@/lib/api/events";
import { eventCategoryLabels } from "@/lib/api/labels";
import { getPeriodRange, type EventPeriod } from "@/lib/dateRanges";
import type { EventCategory, EventDto, PagedResult } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(eventCategoryLabels) as [EventCategory, string][];

const PERIOD_OPTIONS: { value: EventPeriod; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "today", label: "Bu gün" },
  { value: "week", label: "Bu həftə" },
  { value: "month", label: "Bu ay" },
];

type Props = {
  initialData: PagedResult<EventDto>;
  initialIsLive: boolean;
};

export function EventsBrowser({ initialData, initialIsLive }: Props) {
  const [period, setPeriod] = useState<EventPeriod>("all");
  const [category, setCategory] = useState<EventCategory | "">("");
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
    const { from, to } = getPeriodRange(period);
    setStatus("loading");

    eventsApi
      .getPaged({
        publicationStatus: "Published",
        pageSize: 12,
        page,
        category: category || undefined,
        from,
        to,
      })
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
  }, [period, category, page]);

  function retry() {
    const thisRequestId = ++requestIdRef.current;
    const { from, to } = getPeriodRange(period);
    setStatus("loading");
    eventsApi
      .getPaged({ publicationStatus: "Published", pageSize: 12, page, category: category || undefined, from, to })
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

      <div className="mb-8 flex flex-wrap gap-2">
        <div className="flex gap-1.5 rounded-full border border-stone-light bg-paper-soft p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setPeriod(opt.value);
                setPage(1);
              }}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (period === opt.value ? "bg-forest text-cream" : "text-ink-soft hover:text-forest")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as EventCategory | "");
            setPage(1);
          }}
          aria-label="Kateqoriya"
          className="max-w-56"
        >
          <option value="">Bütün kateqoriyalar</option>
          {CATEGORY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Tədbirləri yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState
          title="Bu dövrdə tədbir yoxdur"
          description="Başqa dövr və ya kateqoriya seçin."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-faint">{result.totalCount} tədbir tapıldı</p>
          <div className="grid gap-4">
            {result.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
