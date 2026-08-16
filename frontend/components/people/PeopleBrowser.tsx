"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle, CardMeta } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { peopleApi } from "@/lib/api/people";
import { personCategoryLabels } from "@/lib/api/labels";
import type { PagedResult, PersonDto } from "@/lib/api/types";

const PAGE_SIZE = 16;

type Props = {
  initialData: PagedResult<PersonDto>;
  initialIsLive: boolean;
};

/**
 * Owns pagination for /insanlarimiz after the first server-rendered
 * paint — same "server page 1, client pages after" pattern as
 * ListingsBrowser/EventsBrowser. Every person card links through to its
 * own /insanlarimiz/[id] detail page.
 */
export function PeopleBrowser({ initialData, initialIsLive }: Props) {
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
    peopleApi
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
    peopleApi
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
        <EmptyState title="Hələ profil əlavə edilməyib" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {result.items.map((person) => (
              <Link key={person.id} href={`/insanlarimiz/${person.id}`} className="group">
                <Card variant="default" className="transition-transform group-hover:-translate-y-0.5">
                  <CardMedia aspect="portrait">
                    <VillagePhoto
                      src={person.coverImageUrl ?? undefined}
                      alt={`${person.firstName} ${person.lastName}`}
                      tone="forest"
                      placeholderLabel={`${person.firstName} ${person.lastName}`}
                      sizes="(min-width: 640px) 25vw, 50vw"
                    />
                  </CardMedia>
                  <CardBody>
                    <CardTitle className="text-base line-clamp-2">
                      {person.firstName} {person.lastName}
                    </CardTitle>
                    {person.occupation ? (
                      <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{person.occupation}</p>
                    ) : null}
                    <CardMeta>
                      <Badge tone="forest">{personCategoryLabels[person.category]}</Badge>
                    </CardMeta>
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
