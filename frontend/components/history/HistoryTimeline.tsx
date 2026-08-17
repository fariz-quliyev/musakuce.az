"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { sourceStatusLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { HistoricalEventDto, SourceStatus } from "@/lib/api/types";

/** Source-status glyphs double as the timeline's "event icon" — a real,
 * already-published classification (see sourceStatusLabels) rather than
 * a fabricated event category the data model doesn't have. */
function SourceStatusIcon({ status, className }: { status: SourceStatus; className?: string }) {
  switch (status) {
    case "Verified":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12.3 10.5 15 16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "OfficialSource":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 3h7l4 4v14H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9.5 12.5h5M9.5 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "FamilyArchive":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 11 12 4l8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "OralHistory":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 5h16v10H10l-3.5 3.5V15H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "LocalResearch":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="m19.5 19.5-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "TraditionalStory":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 6.5c3-1.4 6-1.4 8 0v12c-2-1.4-5-1.4-8 0v-12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M20 6.5c-3-1.4-6-1.4-8 0v12c2-1.4 5-1.4 8 0v-12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "UnderResearch":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.7 9.5a2.4 2.4 0 0 1 4.6.9c0 1.5-2.3 1.8-2.3 3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

type Props = { events: HistoricalEventDto[] };

/**
 * Interactive horizontal timeline (tablist pattern): each mini-card is a
 * `role="tab"`, the expanded write-up below is a single `role="tabpanel"`
 * that swaps content on selection. Click and ArrowLeft/ArrowRight/Home/End
 * both drive the same `activeIndex` state — no separate hover behaviour.
 *
 * No HistoricalEvent record carries its own photo yet (the backend DTO
 * has no image field, only PersonDto/PhotoDto/etc. do) — every visual
 * slot below intentionally omits `src` and falls through to
 * VillagePhoto's placeholder rather than borrowing an unrelated real
 * photo, which would misrepresent it as depicting that specific event.
 */
export function HistoryTimeline({ events }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeEvent = events[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < events.length - 1;

  useEffect(() => {
    tabRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  function goTo(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight" && index < events.length - 1) {
      event.preventDefault();
      goTo(index + 1, true);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      goTo(index - 1, true);
    } else if (event.key === "Home" && index !== 0) {
      event.preventDefault();
      goTo(0, true);
    } else if (event.key === "End" && index !== events.length - 1) {
      event.preventDefault();
      goTo(events.length - 1, true);
    }
  }

  if (!activeEvent) return null;

  return (
    <div>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-4 h-px bg-stone-light" />
        <div
          role="tablist"
          aria-label="Zaman xəttində Musaküçə hadisələri"
          className="-mx-5 flex snap-x snap-proximity gap-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0"
        >
          {events.map((event, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={event.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`timeline-tab-${i}`}
                aria-selected={active}
                aria-controls="timeline-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => goTo(i)}
                onKeyDown={(e) => handleTabKeyDown(e, i)}
                className="group flex w-48 shrink-0 snap-start flex-col text-left sm:w-56"
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mb-3 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border-2 transition-all",
                    active
                      ? "scale-110 border-forest bg-forest text-cream"
                      : "border-stone-light bg-paper text-ink-faint group-hover:border-forest-light",
                  )}
                >
                  <SourceStatusIcon status={event.sourceStatus} className="h-4 w-4" />
                </span>
                <div
                  className={cn(
                    "flex flex-1 flex-col overflow-hidden rounded-xl border p-3 shadow-sm transition-all",
                    active
                      ? "-translate-y-1 border-2 border-forest bg-moss-light/30 shadow-md"
                      : "border-stone-light bg-paper/70 group-hover:border-forest-light/60",
                  )}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <VillagePhoto alt={event.title} tone={active ? "forest" : "warm"} placeholderLabel={event.period} sizes="220px" />
                  </div>
                  <p className="mt-2.5 font-display text-sm text-forest">{event.period}</p>
                  <h3 className="mt-0.5 line-clamp-2 font-display text-base leading-snug text-ink">{event.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{event.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="timeline-panel"
        role="tabpanel"
        aria-labelledby={`timeline-tab-${activeIndex}`}
        tabIndex={-1}
        className="mt-6 rounded-2xl border border-stone-light bg-paper p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="terracotta">{activeEvent.period}</Badge>
              <Badge tone="neutral">{sourceStatusLabels[activeEvent.sourceStatus]}</Badge>
            </div>
            <h3 className="mt-3 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-ink">
              {activeEvent.title}
            </h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed whitespace-pre-line text-ink-soft">{activeEvent.description}</p>
            {activeEvent.sourceReference ? (
              <p className="mt-4 text-xs text-ink-faint">
                <span className="font-semibold text-ink">Mənbə: </span>
                {activeEvent.sourceReference}
              </p>
            ) : null}
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md">
            <VillagePhoto
              alt={activeEvent.title}
              tone="forest"
              variant="scene"
              placeholderLabel={`${activeEvent.period} — arxiv fotosu tezliklə əlavə olunacaq`}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-stone-light pt-4">
          <button
            type="button"
            onClick={() => hasPrev && goTo(activeIndex - 1, true)}
            disabled={!hasPrev}
            aria-label="Əvvəlki hadisə"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-dark disabled:pointer-events-none disabled:opacity-40"
          >
            <span aria-hidden>←</span> Əvvəlki
          </button>
          <span className="text-xs text-ink-faint tabular-nums">
            {activeIndex + 1} / {events.length}
          </span>
          <button
            type="button"
            onClick={() => hasNext && goTo(activeIndex + 1, true)}
            disabled={!hasNext}
            aria-label="Növbəti hadisə"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-dark disabled:pointer-events-none disabled:opacity-40"
          >
            Növbəti <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
