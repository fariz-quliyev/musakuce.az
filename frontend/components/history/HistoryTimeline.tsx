"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { sourceStatusLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { HistoricalEventDto, SourceStatus } from "@/lib/api/types";

// Seeded placeholder events (HistoricalEventDto.isDefault) carry an
// admin-facing "this is sample content" notice in their Description —
// never shown verbatim to a public visitor; the admin list flags these
// rows with a "Nümunə" badge instead (see HistoryTable.tsx).
const DEFAULT_EVENT_NOTICE = "Bu hadisə haqqında məlumat hazırlanır — tezliklə əlavə olunacaq.";

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

type Props = { events: HistoricalEventDto[]; initialActiveIndex?: number };

/** Shared write-up content — rendered once inside the desktop shared
 * panel and once inside each mobile item's inline accordion, so the two
 * layouts never drift out of sync. */
function EventDetailContent({
  event,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  index,
  total,
}: {
  event: HistoricalEventDto;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  index: number;
  total: number;
}) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="terracotta">{event.period}</Badge>
            <Badge tone="neutral">{sourceStatusLabels[event.sourceStatus]}</Badge>
          </div>
          <h3 className="mt-3 font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-ink">
            {event.title}
          </h3>
          <p className="mt-3 max-w-xl text-base leading-relaxed whitespace-pre-line text-ink-soft">
            {event.isDefault ? DEFAULT_EVENT_NOTICE : event.description}
          </p>
          {event.detailedText ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed whitespace-pre-line text-ink-soft">{event.detailedText}</p>
          ) : null}
          {event.sourceReference ? (
            <p className="mt-4 text-xs text-ink-faint">
              <span className="font-semibold text-ink">Mənbə: </span>
              {event.sourceReference}
            </p>
          ) : null}
        </div>
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md">
            <VillagePhoto
              src={event.coverImageUrl ?? undefined}
              alt={event.title}
              tone="forest"
              variant="scene"
              placeholderLabel={`${event.period} — arxiv fotosu tezliklə əlavə olunacaq`}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          {event.additionalImages.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {event.additionalImages.map((image) => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                  <VillagePhoto src={image.imageUrl} alt={event.title} tone="warm" sizes="120px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-light pt-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Əvvəlki hadisə"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-dark disabled:pointer-events-none disabled:opacity-40"
        >
          <span aria-hidden>←</span> Əvvəlki
        </button>
        <span className="text-xs text-ink-faint tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Növbəti hadisə"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-dark disabled:pointer-events-none disabled:opacity-40"
        >
          Növbəti <span aria-hidden>→</span>
        </button>
      </div>
    </>
  );
}

/**
 * Museum-wall timeline: a bold horizontal line spans the section, small
 * circular markers sit on it, and clicking one opens a shared write-up
 * panel below (desktop `role="tablist"`/`tab`/`tabpanel`). On narrow
 * viewports this switches to a genuinely different layout — a vertical
 * line down the left edge with the write-up expanding inline under
 * whichever event is selected — not a shrunk copy of the desktop one.
 * Both layouts render simultaneously (toggled by Tailwind breakpoints,
 * never JS media-query branching) and share one `activeIndex`/keyboard
 * model so focus/selection stay in sync if the viewport is resized.
 */
export function HistoryTimeline({ events, initialActiveIndex = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const desktopRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeEvent = events[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < events.length - 1;

  useEffect(() => {
    desktopRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  function goTo(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) {
      desktopRefs.current[index]?.focus();
      mobileRefs.current[index]?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
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
      {/* Desktop / tablet — horizontal museum-wall layout */}
      <div className="hidden sm:block">
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[16.5px] h-[3px] rounded-full bg-forest/70" />
          <div
            role="tablist"
            aria-label="Zaman xəttində Musaküçə hadisələri"
            className="flex gap-7 overflow-x-auto pb-2 lg:gap-9"
          >
            {events.map((event, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={event.id}
                  ref={(el) => {
                    desktopRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`timeline-tab-${i}`}
                  aria-selected={active}
                  aria-controls="timeline-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="group flex w-36 shrink-0 flex-col items-center text-center lg:w-40"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-cream transition-all duration-150",
                      active
                        ? "scale-125 border-forest bg-forest text-cream shadow-md"
                        : "border-stone text-ink-faint group-hover:scale-110 group-hover:border-terracotta group-hover:text-terracotta",
                    )}
                  >
                    <SourceStatusIcon status={event.sourceStatus} className="h-4 w-4" />
                  </span>
                  <div
                    className={cn(
                      "mt-2 w-full rounded-lg px-2 py-1.5 transition-colors",
                      active ? "bg-forest/10" : "group-hover:bg-terracotta/10",
                    )}
                  >
                    <p className={cn("text-xs font-semibold", active ? "text-forest" : "text-terracotta-dark")}>{event.period}</p>
                    <h3 className="mt-0.5 line-clamp-2 font-display text-sm leading-snug text-ink">{event.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                      {event.isDefault ? DEFAULT_EVENT_NOTICE : event.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-3">
          <div
            aria-hidden
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-tl-sm border-t-4 border-l-4 border-forest bg-paper"
          />
          <div
            id="timeline-panel"
            role="tabpanel"
            aria-labelledby={`timeline-tab-${activeIndex}`}
            tabIndex={-1}
            className="rounded-2xl border-t-4 border-forest bg-paper p-5 shadow-sm sm:p-7"
          >
            <EventDetailContent
              event={activeEvent}
              onPrev={() => hasPrev && goTo(activeIndex - 1, true)}
              onNext={() => hasNext && goTo(activeIndex + 1, true)}
              hasPrev={hasPrev}
              hasNext={hasNext}
              index={activeIndex}
              total={events.length}
            />
          </div>
        </div>
      </div>

      {/* Mobile — vertical layout, detail expands inline under the selected event */}
      <ol className="flex flex-col sm:hidden">
        {events.map((event, i) => {
          const active = i === activeIndex;
          const isLast = i === events.length - 1;
          return (
            <li key={event.id} className="relative pl-9">
              <span
                aria-hidden
                className={cn("absolute top-9 left-[15px] w-[2px] bg-stone-light", isLast ? "bottom-4" : "bottom-0")}
              />
              <button
                ref={(el) => {
                  mobileRefs.current[i] = el;
                }}
                type="button"
                aria-expanded={active}
                aria-controls={`timeline-mobile-panel-${i}`}
                onClick={() => goTo(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="flex w-full items-start gap-3 py-3 text-left"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-2 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-cream transition-all duration-150",
                    active ? "scale-110 border-forest bg-forest text-cream shadow-md" : "border-stone text-ink-faint",
                  )}
                >
                  <SourceStatusIcon status={event.sourceStatus} className="h-3.5 w-3.5" />
                </span>
                <div className={cn("flex-1 rounded-lg px-2 py-1", active && "bg-forest/10")}>
                  <p className={cn("text-xs font-semibold", active ? "text-forest" : "text-terracotta-dark")}>{event.period}</p>
                  <h3 className="mt-0.5 font-display text-base leading-snug text-ink">{event.title}</h3>
                  {!active ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                      {event.isDefault ? DEFAULT_EVENT_NOTICE : event.description}
                    </p>
                  ) : null}
                </div>
              </button>

              {active ? (
                <div
                  id={`timeline-mobile-panel-${i}`}
                  role="region"
                  aria-label={event.title}
                  className="mb-4 rounded-2xl border-t-4 border-forest bg-paper p-4 shadow-sm"
                >
                  <EventDetailContent
                    event={event}
                    onPrev={() => hasPrev && goTo(activeIndex - 1, true)}
                    onNext={() => hasNext && goTo(activeIndex + 1, true)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    index={activeIndex}
                    total={events.length}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
