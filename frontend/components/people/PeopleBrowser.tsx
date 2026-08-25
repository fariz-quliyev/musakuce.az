"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { peopleApi } from "@/lib/api/people";
import { personCategoryLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { PagedResult, PersonCategory, PersonDto } from "@/lib/api/types";

const PAGE_SIZE = 16;
const CATEGORY_OPTIONS = Object.entries(personCategoryLabels) as [PersonCategory, string][];

type Props = {
  initialData: PagedResult<PersonDto>;
  initialIsLive: boolean;
};

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "border-forest bg-forest text-ink-on-dark"
          : "border-stone-light bg-paper text-ink-soft hover:bg-paper-soft",
      )}
    >
      {label}
    </button>
  );
}

/**
 * Owns pagination for /insanlarimiz after the first server-rendered
 * paint — same "server page 1, client pages after" pattern as
 * ListingsBrowser/EventsBrowser. Every person card links through to its
 * own /insanlarimiz/[id] detail page.
 */
export function PeopleBrowser({ initialData, initialIsLive }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PersonCategory | "">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initialData);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const isFirstRender = useRef(true);
  // Monotonically increasing request token — guards against a slow,
  // now-stale request overwriting a faster, newer one's result (same
  // pattern as ListingsBrowser).
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
      peopleApi
        .getPaged({
          publicationStatus: "Published",
          pageSize: PAGE_SIZE,
          page,
          category: category || undefined,
          search: search || undefined,
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
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [search, category, page]);

  function retry() {
    const thisRequestId = ++requestIdRef.current;
    setStatus("loading");
    peopleApi
      .getPaged({
        publicationStatus: "Published",
        pageSize: PAGE_SIZE,
        page,
        category: category || undefined,
        search: search || undefined,
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

      <div className="mb-6">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Ad, soyad və ya peşə üzrə axtarış…"
          aria-label="İnsan axtar"
          className="max-w-md"
        />
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Kateqoriya filtri">
        <FilterPill
          label="Bütün peşələr"
          active={category === ""}
          onClick={() => {
            setCategory("");
            setPage(1);
          }}
        />
        {CATEGORY_OPTIONS.map(([value, label]) => (
          <FilterPill
            key={value}
            label={label}
            active={category === value}
            onClick={() => {
              setCategory(value);
              setPage(1);
            }}
          />
        ))}
      </div>

      {status === "error" ? (
        <EmptyState
          tone="error"
          title="Profilləri yükləmək mümkün olmadı"
          description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
          action={
            <Button size="sm" onClick={retry}>
              Yenidən cəhd et
            </Button>
          }
        />
      ) : status === "loading" ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <EmptyState
          title={search || category ? "Bu axtarışa uyğun profil tapılmadı" : "Hələ profil əlavə edilməyib"}
          description={search || category ? "Filtri dəyişib yenidən cəhd edin." : undefined}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-faint">{result.totalCount} profil tapıldı</p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {result.items.map((person) => (
              <Link key={person.id} href={`/insanlarimiz/${person.id}`} className="group">
                <Card variant="default" className="transition-transform group-hover:-translate-y-0.5">
                  <CardMedia aspect="portrait" className="overflow-hidden">
                    <VillagePhoto
                      src={person.coverImageUrl ?? undefined}
                      alt={`${person.firstName} ${person.lastName}`}
                      tone="forest"
                      placeholderLabel={`${person.firstName} ${person.lastName}`}
                      sizes="(min-width: 640px) 25vw, 50vw"
                      imageClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category badge floats on the photo itself, same
                        gradient-overlay treatment already used for the
                        related-people cards on /kendimizin-sesi. */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
                    <Badge tone="forest" className="absolute bottom-3 left-3 bg-forest/90 text-ink-on-dark">
                      {personCategoryLabels[person.category]}
                    </Badge>
                  </CardMedia>
                  <CardBody>
                    <CardTitle className="text-base line-clamp-2">
                      {person.firstName} {person.lastName}
                    </CardTitle>
                    {person.occupation ? (
                      <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{person.occupation}</p>
                    ) : null}
                  </CardBody>
                </Card>
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
