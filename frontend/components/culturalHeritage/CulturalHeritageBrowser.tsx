"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardMedia, CardBody, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { cn } from "@/lib/cn";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { culturalHeritageKindLabels } from "@/lib/api/labels";
import type { CulturalHeritageItemDto, CulturalHeritageKind, PagedResult } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(culturalHeritageKindLabels) as [CulturalHeritageKind, string][];

type Props = {
  initialData: PagedResult<CulturalHeritageItemDto>;
  initialIsLive: boolean;
};

export function CulturalHeritageBrowser({ initialData, initialIsLive }: Props) {
  const [kind, setKind] = useState<CulturalHeritageKind | "">("");
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
    culturalHeritageApi
      .getPaged({ publicationStatus: "Published", pageSize: 60, kind: kind || undefined })
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
  }, [kind]);

  const [featured, ...rest] = result.items;

  return (
    <div>
      <DataSourceNote isLive={isLive} />

      <div className="mb-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setKind("")}
          aria-pressed={kind === ""}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            kind === "" ? "border-gold bg-gold text-ink" : "border-stone-light bg-paper text-ink-soft hover:bg-paper-soft",
          )}
        >
          Hamısı
        </button>
        {KIND_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            aria-pressed={kind === value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              kind === value ? "border-gold bg-gold text-ink" : "border-stone-light bg-paper text-ink-soft hover:bg-paper-soft",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {status === "error" ? (
        <EmptyState tone="error" title="Nəticələri yükləmək mümkün olmadı" description="Bir az sonra yenidən cəhd edin." />
      ) : result.items.length === 0 ? (
        <EmptyState title="Mədəni irs arxivinə hələ material əlavə edilməyib." />
      ) : (
        <>
          {featured ? (
            <Link href={`/medeniyyet/${featured.id}`} className="mb-10 block">
              <div className="grid gap-0 overflow-hidden rounded-xl border border-stone-light bg-paper shadow-md sm:grid-cols-2">
                <div className="aspect-[4/3] sm:aspect-auto">
                  <VillagePhoto
                    src={featured.coverImageUrl ?? undefined}
                    alt={featured.title}
                    tone="warm"
                    placeholderLabel={featured.title}
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <Badge tone="gold" className="w-fit">
                    {culturalHeritageKindLabels[featured.kind]}
                  </Badge>
                  <h3 className="mt-4 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-ink">
                    {featured.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{featured.description}</p>
                </div>
              </div>
            </Link>
          ) : null}

          {rest.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <Link key={item.id} href={`/medeniyyet/${item.id}`}>
                  <Card variant="default" className="h-full">
                    <CardMedia aspect="square">
                      <VillagePhoto
                        src={item.coverImageUrl ?? undefined}
                        alt={item.title}
                        tone="warm"
                        placeholderLabel={item.title}
                        sizes="(min-width: 640px) 33vw, 50vw"
                      />
                    </CardMedia>
                    <CardBody>
                      <Badge tone="gold">{culturalHeritageKindLabels[item.kind]}</Badge>
                      <CardTitle className="mt-2 text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
