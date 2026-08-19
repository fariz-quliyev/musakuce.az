"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { sourceStatusLabels } from "@/lib/api/labels";
import { cn } from "@/lib/cn";
import { sanitizeRichText } from "@/lib/richText";
import type { EventIcon, HistoricalEventDto } from "@/lib/api/types";

// Seeded placeholder events (HistoricalEventDto.isDefault) carry an
// admin-facing "this is sample content" notice in their Description —
// never shown verbatim to a public visitor; the admin list flags these
// rows with a "Nümunə" badge instead (see HistoryTable.tsx).
const DEFAULT_EVENT_NOTICE = "Bu hadisə haqqında məlumat hazırlanır — tezliklə əlavə olunacaq.";

/** Very faint paper-grain, generated inline (an SVG feTurbulence filter as
 * a data URI) rather than shipped as an image asset — a few hundred bytes
 * inlined in the JS bundle instead of a network request, and tunable to
 * stay subtle (opacity 0.045) without ever competing with text contrast.
 * Layered under two soft corner-darkening gradients in the panel's own
 * inline style below for the "aged document" edge effect. */
const PARCHMENT_GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E";

const PARCHMENT_BACKGROUND_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-parchment)",
  backgroundImage: [
    "radial-gradient(circle at 10% 6%, rgba(31,52,56,0.06), transparent 40%)",
    "radial-gradient(circle at 92% 96%, rgba(31,52,56,0.07), transparent 42%)",
    `url("${PARCHMENT_GRAIN}")`,
  ].join(", "),
};

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
 * switching events resets the selection back to the cover image.
 *
 * The dominant visual element of its column (§editorial two-column
 * redesign) — sized to fill the gallery column's full height on
 * desktop (`lg:h-full`, stretching to match whatever height the
 * write-up text next to it naturally takes), a fixed landscape box on
 * narrower viewports where there's no shared row height to match.
 * `object-contain` (not the site's usual `object-cover`) is
 * deliberate: these are often archival illustrations/documents where
 * cropping any part would lose real content, unlike an ordinary scenic
 * photo where a center-crop is harmless — letterboxing inside the
 * frame is the correct trade-off here. The `bg-paper-soft` on the
 * inner frame is what that letterboxing sits on. */
function EventGallery({ event }: { event: HistoricalEventDto }) {
  const [selected, setSelected] = useState(0);
  const images = [
    ...(event.coverImageUrl ? [{ url: event.coverImageUrl, alt: event.title }] : []),
    ...event.additionalImages.map((img) => ({ url: img.imageUrl, alt: event.title })),
  ];
  const frameClass =
    "aspect-[4/3] w-full overflow-hidden rounded-md border border-parchment-line/80 bg-paper-soft p-1 shadow-sm ring-1 ring-inset ring-white/40 lg:aspect-auto lg:h-full";

  if (images.length === 0) {
    return (
      <div className={frameClass}>
        <div className="h-full w-full overflow-hidden rounded-[3px]">
          <VillagePhoto alt={event.title} tone="warm" placeholderLabel="Foto tezliklə əlavə olunacaq" />
        </div>
      </div>
    );
  }

  const main = images[Math.min(selected, images.length - 1)];

  return (
    <div>
      <div className={frameClass}>
        <div className="h-full w-full overflow-hidden rounded-[3px] bg-paper-soft">
          <VillagePhoto
            src={main.url}
            alt={main.alt}
            tone="forest"
            sizes="(min-width: 1024px) 55vw, 100vw"
            imageClassName="object-contain"
          />
        </div>
      </div>
      {images.length > 1 ? (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Şəkil ${i + 1}`}
              aria-current={i === selected}
              className={cn(
                "h-10 w-10 shrink-0 overflow-hidden rounded border transition-colors",
                i === selected ? "border-parchment-accent-ink" : "border-parchment-line/60 opacity-60 hover:opacity-100",
              )}
            >
              <VillagePhoto src={image.url} alt="" tone="warm" sizes="40px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Shared write-up content — rendered once inside the desktop shared
 * panel and once inside each mobile item's inline accordion, so the two
 * layouts never drift out of sync.
 *
 * Restyled (§Timeline parchment redesign) as an archival-document write-up
 * rather than a CMS content card: period/status read as a small caption
 * line (not pill badges), a hairline rule stands in for the old heavy
 * accent bar, and the gallery moves to a compact side position. Text stays
 * plain HTML throughout — no content is rendered into the background
 * image, so SEO/selection/accessibility/responsive reflow are all
 * unaffected by the visual treatment. */
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
    <div className="motion-safe:animate-[parchment-reveal_380ms_ease-out]">
      {/* Explicit two-column editorial grid on desktop (§editorial
          two-column redesign) — text ~43%, gallery ~57%, both sharing
          one row so the gallery naturally stretches (CSS Grid's default
          stretch alignment) to match however tall the write-up ends up
          being; no JS measurement needed. `min-h-[380px]` is a floor,
          not a fixed height — events with only a line or two of text
          (most of them, in practice) would otherwise collapse the row
          short enough that the image shrank to a small letterboxed
          thumbnail instead of reading as the dominant element the
          design calls for; a long write-up still grows the row past
          this floor exactly as before. Replaces an earlier float-based
          attempt (text wrapping beside the image, then reflowing to
          full width below it) — that made "the gallery column" a
          moving target tied to each event's own text length instead of
          a fixed, predictable fraction of the card. Stacks (text, then
          image) below `lg`, where there's no shared row to stretch
          against anyway. */}
      <div className="grid gap-6 lg:grid-cols-[43%_1fr] lg:min-h-[380px] lg:gap-8">
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] font-semibold tracking-[0.05em] text-parchment-accent-ink uppercase">
            <span>{event.period}</span>
            <span aria-hidden className="text-parchment-line">
              ·
            </span>
            <span className="text-parchment-accent normal-case">{sourceStatusLabels[event.sourceStatus]}</span>
          </p>
          <h3 className="mt-2 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-ink">
            {event.title}
          </h3>
          <div aria-hidden className="mt-3 h-px w-14 bg-parchment-line" />
          <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
            {event.isDefault ? DEFAULT_EVENT_NOTICE : event.description}
          </p>
          {event.detailedText ? (
            <div
              className={cn(
                "mt-3 text-[15px] leading-relaxed text-ink-soft",
                "[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0",
                "[&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink",
                "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-ink",
                "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
                "[&_a]:text-parchment-accent-ink [&_a]:underline [&_a]:underline-offset-2",
                "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-parchment-line [&_blockquote]:pl-3 [&_blockquote]:italic",
              )}
              // detailedText is admin-authored rich text (RichTextEditor,
              // same fixed tag allowlist as Person.biography) — sanitized
              // just like that field, never rendered raw.
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.detailedText) }}
            />
          ) : null}
          {event.sourceReference ? (
            <p className="mt-3 text-xs text-ink-faint">
              <span className="font-semibold text-ink">Mənbə: </span>
              {event.sourceReference}
            </p>
          ) : null}
        </div>
        <EventGallery key={event.id} event={event} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-parchment-line/70 pt-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Əvvəlki hadisə"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-parchment-accent-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <span aria-hidden>←</span> Əvvəlki
        </button>
        <span className="text-[11px] text-ink-faint tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Növbəti hadisə"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-parchment-accent-ink transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          Növbəti <span aria-hidden>→</span>
        </button>
      </div>
    </div>
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
  const trackRef = useRef<HTMLDivElement>(null);
  const panelAnchorRef = useRef<HTMLDivElement>(null);
  const [caretLeft, setCaretLeft] = useState<number | null>(null);
  // Stays false through the initial mount so the very first correction
  // (server-rendered fallback → real measured position) snaps instantly
  // instead of visibly sliding; enabled one tick later so only genuine
  // selection changes animate.
  const [caretTransitionReady, setCaretTransitionReady] = useState(false);
  const activeEvent = events[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < events.length - 1;

  useEffect(() => {
    desktopRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    // Deliberately deferred to the tick after mount's paint — see the
    // caretTransitionReady comment above. Enabling this synchronously in
    // the layout effect that also corrects caretLeft would re-admit the
    // mid-transition flakiness that fix addressed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaretTransitionReady(true);
  }, []);

  // Keeps the little pointer under the panel aligned with whichever
  // marker is active, including while the track's own smooth-scroll
  // animation (above) is still settling — recomputed on every scroll
  // tick of the track, not just once on selection change.
  useLayoutEffect(() => {
    function updateCaret() {
      const btn = desktopRefs.current[activeIndex];
      const anchor = panelAnchorRef.current;
      if (!btn || !anchor) return;
      const btnRect = btn.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const raw = btnRect.left + btnRect.width / 2 - anchorRect.left;
      setCaretLeft(Math.min(Math.max(raw, 20), anchorRect.width - 20));
    }
    updateCaret();
    const track = trackRef.current;
    track?.addEventListener("scroll", updateCaret);
    window.addEventListener("resize", updateCaret);
    return () => {
      track?.removeEventListener("scroll", updateCaret);
      window.removeEventListener("resize", updateCaret);
    };
  }, [activeIndex, events.length]);

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
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[26.5px] h-[3px] rounded-full bg-forest/70" />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute top-5 right-0 h-4 w-4 text-forest/70"
          >
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            ref={trackRef}
            role="tablist"
            aria-label="Zaman xəttində Musaküçə hadisələri"
            className="flex items-start justify-between gap-5 overflow-x-auto pt-2 pb-2 lg:gap-8"
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
                      "relative z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 bg-cream transition-transform duration-200",
                      active
                        ? "scale-125 border-forest bg-forest text-cream shadow-md"
                        : "border-stone text-ink-faint group-hover:scale-110 group-hover:border-terracotta group-hover:text-terracotta",
                    )}
                  >
                    <MarkerGlyph event={event} iconClassName="h-5 w-5" />
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

        <div ref={panelAnchorRef} className="relative mt-3">
          <div
            aria-hidden
            style={{ left: caretLeft ?? "50%" }}
            className={cn(
              "absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-tl-sm border-t border-l border-parchment-line bg-parchment",
              caretTransitionReady && "transition-[left] duration-200",
            )}
          />
          <div
            id="timeline-panel"
            role="tabpanel"
            aria-labelledby={`timeline-tab-${activeIndex}`}
            tabIndex={-1}
            style={PARCHMENT_BACKGROUND_STYLE}
            className="overflow-hidden rounded-lg border border-parchment-line shadow-md sm:rounded-xl"
          >
            <div className="p-6 sm:p-8 lg:p-12">
              <EventDetailContent
                key={activeEvent.id}
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
                className={cn("absolute top-10 left-[17px] w-[2px] bg-stone-light", isLast ? "bottom-4" : "bottom-0")}
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
                    "absolute top-2 left-0 z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 bg-cream transition-transform duration-200",
                    active ? "scale-110 border-forest bg-forest text-cream shadow-md" : "border-stone text-ink-faint",
                  )}
                >
                  <MarkerGlyph event={event} iconClassName="h-4 w-4" />
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
                  style={PARCHMENT_BACKGROUND_STYLE}
                  className="mb-4 overflow-hidden rounded-lg border border-parchment-line p-5 shadow-md"
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
