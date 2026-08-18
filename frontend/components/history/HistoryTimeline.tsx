"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { sourceStatusLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import type { EventIcon, HistoricalEventDto } from "@/lib/api/types";

// Seeded placeholder events (HistoricalEventDto.isDefault) carry an
// admin-facing "this is sample content" notice in their Description —
// never shown verbatim to a public visitor; the admin list flags these
// rows with a "Nümunə" badge instead (see HistoryTable.tsx).
const DEFAULT_EVENT_NOTICE = "Bu hadisə haqqında məlumat hazırlanır — tezliklə əlavə olunacaq.";

/** Admin-picked marker category (HistoricalEvent.eventIcon) — never
 * inferred from title/description text, which would silently mislabel
 * an event the moment its wording didn't match an expected keyword. */
function EventIconGraphic({ icon, className }: { icon: EventIcon; className?: string }) {
  switch (icon) {
    case "Settlement":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 11 12 4l8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "Religion":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 21v-6a5 5 0 0 1 10 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 4v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="4" r="0.9" fill="currentColor" stroke="none" />
          <path d="M4 21h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Education":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 5 3 9l9 4 9-4-9-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 11.2V16c0 1.1 2.2 2 5 2s5-.9 5-2v-4.8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M21 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "People":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
          <path d="M15 19c.3-2.1 1.7-3.6 3.6-3.6 1.5 0 2.8 1 3.3 2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
        </svg>
      );
    case "War":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3c2 3 3.5 5 3.5 7.5A3.5 3.5 0 0 1 12 14a3.5 3.5 0 0 1-3.5-3.5C8.5 8 10 6 12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8 21h8M10 21v-4a2 2 0 0 1 4 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Agriculture":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 21V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M12 8c-2-1-3-2.5-3-4.5C10.5 3.5 12 4.8 12 6.5M12 8c2-1 3-2.5 3-4.5C13.5 3.5 12 4.8 12 6.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 13.5c-1.7-.9-2.6-2.2-2.6-3.9C10.9 10 12 11 12 12.5M12 13.5c1.7-.9 2.6-2.2 2.6-3.9C13.1 10 12 11 12 12.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Achievement":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="m9 13-1.5 7 4.5-2.5 4.5 2.5L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m10 9 1.3 1.3L14 7.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Flag":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 21V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 5h12l-3 3.5L18 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "Culture":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 6.2c-1.8-1-4-1.4-6-1.1v13c2-.3 4.2.1 6 1.1 1.8-1 4-1.4 6-1.1v-13c-2-.3-4.2.1-6 1.1Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 6.2v13" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </svg>
      );
    case "Document":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 3h7l4 4v14H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9.5 12.5h5M9.5 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "General":
      return (
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

/** Marker content: an admin-uploaded custom icon image (fills the whole
 * circle, edge-to-edge) takes over when present, otherwise the category
 * glyph from EventIconGraphic. */
function MarkerGlyph({ event, iconClassName }: { event: HistoricalEventDto; iconClassName?: string }) {
  if (event.iconImageUrl) {
    return <Image src={event.iconImageUrl} alt="" fill sizes="40px" className="rounded-full object-cover" />;
  }
  return <EventIconGraphic icon={event.eventIcon} className={iconClassName} />;
}

/** Cover image + additional images as one clickable gallery — clicking a
 * thumbnail swaps the main image. Keyed by event id from the caller so
 * switching events resets the selection back to the cover image. */
function EventGallery({ event }: { event: HistoricalEventDto }) {
  const [selected, setSelected] = useState(0);
  const images = [
    ...(event.coverImageUrl ? [{ url: event.coverImageUrl, alt: event.title }] : []),
    ...event.additionalImages.map((img) => ({ url: img.imageUrl, alt: event.title })),
  ];

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
        <VillagePhoto alt={event.title} tone="warm" placeholderLabel="Foto tezliklə əlavə olunacaq" />
      </div>
    );
  }

  const main = images[Math.min(selected, images.length - 1)];

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md">
        <VillagePhoto src={main.url} alt={main.alt} tone="forest" sizes="(min-width: 1024px) 42vw, 100vw" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Şəkil ${i + 1}`}
              aria-current={i === selected}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === selected ? "border-forest" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <VillagePhoto src={image.url} alt="" tone="warm" sizes="56px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-start lg:gap-10">
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
        <EventGallery key={event.id} event={event} />
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

type Props = { events: HistoricalEventDto[]; initialActiveIndex?: number };

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
 *
 * Marker spacing: the desktop track is `flex justify-between` with each
 * event at a fixed width — with few events the browser distributes the
 * leftover row width as extra gap between them (spreading them across
 * the full line); with many events there's no leftover space to
 * distribute, so they pack at their natural width and the track scrolls.
 * No JS measurement/ResizeObserver — pure CSS handles both cases.
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
            className="flex items-start justify-between gap-5 overflow-x-auto pb-2 lg:gap-8"
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
                      "relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 bg-cream transition-transform duration-200",
                      active
                        ? "scale-125 border-forest bg-forest text-cream shadow-md"
                        : "border-stone text-ink-faint group-hover:scale-110 group-hover:border-terracotta group-hover:text-terracotta",
                    )}
                  >
                    <MarkerGlyph event={event} iconClassName="h-4 w-4" />
                  </span>
                  <div
                    className={cn(
                      "mt-2 w-full rounded-lg px-2 py-1.5 transition-colors duration-200",
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
                    "absolute top-2 left-0 z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 bg-cream transition-transform duration-200",
                    active ? "scale-110 border-forest bg-forest text-cream shadow-md" : "border-stone text-ink-faint",
                  )}
                >
                  <MarkerGlyph event={event} iconClassName="h-3.5 w-3.5" />
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
