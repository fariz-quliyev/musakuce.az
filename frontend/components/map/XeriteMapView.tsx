"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { SelectedPlaceCard } from "./SelectedPlaceCard";
import { placeCategoryLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { PlaceCategory, PlaceDto } from "@/lib/api/types";

const MAP_HEIGHT = "h-[420px] sm:h-[560px] lg:h-[650px]";

const PlacesMap = dynamic(() => import("./PlacesMap").then((m) => m.PlacesMap), {
  ssr: false,
  loading: () => <Skeleton className={cn(MAP_HEIGHT, "w-full rounded-xl")} />,
});

type Props = {
  places: PlaceDto[];
  isLive: boolean;
};

/**
 * Owns category filtering + marker selection for /xerite. Filtering runs
 * entirely client-side over the already-fetched place list (no category
 * param exists on the API today, and adding one isn't necessary — the
 * full published-places set is small enough to fetch once), so switching
 * a filter pill never triggers a network request or resets the map's
 * pan/zoom position.
 */
export function XeriteMapView({ places, isLive }: Props) {
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    const present = new Set(places.map((p) => p.category).filter((c): c is PlaceCategory => c !== null));
    return (Object.keys(placeCategoryLabels) as PlaceCategory[]).filter((c) => present.has(c));
  }, [places]);

  const filteredPlaces = useMemo(
    () => (category === "all" ? places : places.filter((p) => p.category === category)),
    [places, category],
  );

  const selectedPlace = filteredPlaces.find((p) => p.id === selectedId) ?? null;
  const hasPlaces = places.length > 0;

  // The real map (real coordinates, real OpenStreetMap tiles) is the
  // village itself, independent of whether any Place pins exist yet —
  // it must never be replaced wholesale by an empty-state box. Only the
  // filter row (pointless with nothing to filter) and the marker count
  // announcement are conditional on having real places.
  return (
    <div>
      <DataSourceNote isLive={isLive} />

      {hasPlaces ? (
        <div
          role="group"
          aria-label="Kateqoriya filtri"
          className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          <FilterPill label="Hamısı" active={category === "all"} onClick={() => setCategory("all")} />
          {availableCategories.map((c) => (
            <FilterPill
              key={c}
              label={placeCategoryLabels[c]}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      ) : (
        <Badge tone="neutral" className="mb-6">
          Xəritədə hələ məkan əlavə edilməyib — tezliklə əlavə olunacaq
        </Badge>
      )}

      {hasPlaces ? (
        <p className="sr-only" aria-live="polite">
          Xəritədə {filteredPlaces.length} məkan göstərilir: {filteredPlaces.map((p) => p.name).join(", ")}.
        </p>
      ) : null}

      <div
        role="region"
        aria-label="Musaküçə xəritəsi"
        className={cn(MAP_HEIGHT, "w-full overflow-hidden rounded-xl border border-stone-light shadow-lg")}
      >
        <PlacesMap places={filteredPlaces} selectedId={selectedId} onSelect={(p) => setSelectedId(p.id)} />
      </div>

      {selectedPlace ? (
        <SelectedPlaceCard place={selectedPlace} onClose={() => setSelectedId(null)} />
      ) : null}
    </div>
  );
}

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
