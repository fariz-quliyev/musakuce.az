"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { cn } from "@/lib/cn";
import { memorialApi } from "@/lib/api/memorial";
import { memorialCategoryLabels } from "@/lib/api/labels";
import type { MemorialCategory, MemorialRecordDto, PagedResult } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(memorialCategoryLabels) as [MemorialCategory, string][];

type Props = {
  initialData: PagedResult<MemorialRecordDto>;
  initialIsLive: boolean;
};

/**
 * Quiet, respectful archive browser — memorial-toned cards (no hover
 * lift, muted palette), category pills instead of a dropdown, and a
 * plain search field. Mirrors ListingsBrowser's client-refetch pattern
 * but deliberately without its livelier styling.
 */
export function MemorialBrowser({ initialData, initialIsLive }: Props) {
  const [category, setCategory] = useState<MemorialCategory | "">("");
  const [search, setSearch] = useState("");
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

    const delay = search ? 400 : 0;
    const timeoutId = setTimeout(() => {
      const thisRequestId = ++requestIdRef.current;
      setStatus("loading");
      memorialApi
        .getPaged({ publicationStatus: "Published", pageSize: 60, category: category || undefined, search: search || undefined })
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
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [category, search]);

  return (
    <div>
      <DataSourceNote isLive={isLive} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          aria-pressed={category === ""}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            category === ""
              ? "border-memorial-accent bg-memorial-accent text-cream"
              : "border-memorial-line bg-memorial-surface text-memorial-ink hover:bg-memorial-bg",
          )}
        >
          Hamısı
        </button>
        {CATEGORY_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            aria-pressed={category === value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === value
                ? "border-memorial-accent bg-memorial-accent text-cream"
                : "border-memorial-line bg-memorial-surface text-memorial-ink hover:bg-memorial-bg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ad ilə axtar…"
        aria-label="Xatirə arxivində axtar"
        className="mb-8 max-w-sm"
      />

      {status === "error" ? (
        <EmptyState tone="memorial" title="Nəticələri yükləmək mümkün olmadı" description="Bir az sonra yenidən cəhd edin." />
      ) : result.items.length === 0 ? (
        <EmptyState tone="memorial" title="Xatirə arxivinə hələ məlumat əlavə edilməyib." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((record) => (
            <Link key={record.id} href={`/xatire/${record.id}`}>
              <Card variant="memorial" className="h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <VillagePhoto
                      src={record.coverImageUrl ?? undefined}
                      alt={record.fullName}
                      tone="memorial"
                      placeholderLabel=""
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base text-memorial-ink">{record.fullName}</CardTitle>
                    <Badge tone="memorial" className="mt-1.5">
                      {memorialCategoryLabels[record.category]}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
