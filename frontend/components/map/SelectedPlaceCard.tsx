import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { placeCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { PlaceDto } from "@/lib/api/types";

type Props = {
  place: PlaceDto;
  onClose: () => void;
};

/**
 * The full information card for a clicked marker — deliberately separate
 * from the (intentionally compact) Leaflet popup, since popups clip/
 * overflow easily on small screens (spec §12) and can't host richer
 * content like a photo comfortably.
 */
export function SelectedPlaceCard({ place, onClose }: Props) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl border border-stone-light bg-paper shadow-md">
      <button
        type="button"
        onClick={onClose}
        aria-label="Bağla"
        className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-ink-soft shadow-sm transition-colors hover:bg-paper hover:text-ink"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {place.coverImageUrl ? (
        <div className="h-44 w-full sm:h-56">
          <VillagePhoto src={place.coverImageUrl} alt={place.name} tone="warm" />
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={place.kind === "Historical" ? "terracotta" : "forest"}>
            {place.category ? placeCategoryLabels[place.category] : place.kind}
          </Badge>
          {place.sourceStatus ? (
            <Badge tone="neutral">{sourceStatusLabels[place.sourceStatus]}</Badge>
          ) : null}
        </div>

        <h3 className="mt-3 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-ink">
          {place.name}
        </h3>

        {place.description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{place.description}</p>
        ) : null}

        {place.kind === "Historical" && place.historicalBackground ? (
          <div className="mt-4 border-t border-stone-light pt-4">
            <p className="text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
              Tarixi məlumat
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{place.historicalBackground}</p>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-ink-faint">
          {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
        </p>

        <div className="mt-4">
          <Button href={directionsUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Marşrutu aç →
          </Button>
        </div>

        <div className="mt-4">
          <SuggestionCta targetEntityType="Place" targetEntityId={place.id} />
        </div>
      </div>
    </div>
  );
}
