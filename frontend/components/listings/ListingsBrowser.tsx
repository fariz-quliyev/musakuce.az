"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { ListingCard } from "./ListingCard";
import { listingsApi } from "@/lib/api/listings";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import type { ClassifiedCategory, ListingDto, PagedResult } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(classifiedCategoryLabels) as [ClassifiedCategory, string][];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Ən yeni" },
  { value: "priceAsc", label: "Qiymət: aşağıdan yuxarı" },
  { value: "priceDesc", label: "Qiymət: yuxarıdan aşağı" },
];

type Props = {
  initialData: PagedResult<ListingDto>;
  initialIsLive: boolean;
  initialCategory?: ClassifiedCategory;
};

/**
 * Owns all interaction for /elanlar after the first server-rendered
 * paint: search, category, sort, pagination. The first page load stays
 * server-rendered (via `withFallback`, mock data possible); every
 * interaction after that talks to the live API directly — a failure
 * here shows a real error state with retry rather than silently
 * swapping in mock content (spec: never present mock as real data).
 */
export function ListingsBrowser({ initialData, initialIsLive, initialCategory }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ClassifiedCategory | "">(initialCategory ?? "");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState(initialData);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const isFirstRender = useRef(true);
  // Monotonically increasing request token — guards against a slow,
  // now-stale request overwriting a faster, newer one's result.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const delay = search ? 400 : 0;
    const timeoutId = setTimeout(() => {
      const thisRequestId = ++requestIdRef.current;
      setStatus("loading");

      listingsApi
        .getPaged({
          listingStatus: "Active",
          pageSize: 12,
          page,
          category: category || undefined,
          search: search || undefined,
          sortBy,
        })
        .then((data) => {
          if (requestIdRef.current !== thisRequestId) return; // superseded
          setResult(data);
          setIsLive(true);
          setStatus("idle");
        })
        .catch(() => {
          if (requestIdRef.current !== thisRequestId) return;
          setStatus("error");
        });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [search, category, sortBy, page]);

  function retry() {
    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    listingsApi
      .getPaged({
        listingStatus: "Active",
        pageSize: 12,
        page,
        category: category || undefined,
        search: search || undefined,
        sortBy,
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
  }

  return (
    <div>
      <DataSourceNote isLive={isLive} />

      <div className="mb-8 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Elan axtar…"
          aria-label="Elan axtar"
          className="max-w-xs"
        />
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as ClassifiedCategory | "");
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
        <Select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          aria-label="Sıralama"
          className="max-w-56"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Elanları yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState
          title={search || category ? "Bu axtarışa uyğun elan tapılmadı" : "Hələ elan yoxdur"}
          description={
            search || category ? "Filtri dəyişib yenidən cəhd edin." : "İlk elanı siz yerləşdirin."
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-faint">{result.totalCount} elan tapıldı</p>
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
