"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

const STEP = 5;
const DEFAULT_POSITION = 50;

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  sizes?: string;
  className?: string;
};

/**
 * Lightweight Before/After comparison slider — no external library.
 * Both images are absolutely positioned in the same box (`fill`, same
 * `object-contain`), so they overlay pixel-for-pixel; only the "after"
 * layer's `clip-path` changes as the handle moves, which is a compositor-
 * only operation (no layout/reflow).
 *
 * Performance: during a drag, the handle position and clip-path are
 * written directly to the DOM via refs (`applyPosition`) — React state
 * (`position`) is only committed once per gesture (pointerdown/up and
 * keyboard steps), not on every pointermove. This keeps drag interaction
 * at native pointer-event speed instead of a React re-render per frame,
 * while `position` still stays the single source of truth for the next
 * render and for `aria-valuenow`.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = "Əvvəl",
  afterLabel = "Sonra",
  sizes = "(min-width: 640px) 80vw, 96vw",
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const afterLayerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  function applyPosition(percent: number) {
    const clamped = Math.min(100, Math.max(0, percent));
    if (afterLayerRef.current) afterLayerRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    if (handleRef.current) handleRef.current.style.left = `${clamped}%`;
    return clamped;
  }

  function percentFromClientX(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return position;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPosition(applyPosition(percentFromClientX(event.clientX)));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    // Direct DOM write only — no setState while dragging (see doc comment above).
    applyPosition(percentFromClientX(event.clientX));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setPosition(applyPosition(percentFromClientX(event.clientX)));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = position - STEP;
    else if (event.key === "ArrowRight") next = position + STEP;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;
    if (next === null) return;
    // Stop the arrow key from also reaching PhotoLightbox's window-level
    // prev/next-photo listener while the handle is focused.
    event.preventDefault();
    event.stopPropagation();
    setPosition(applyPosition(next));
  }

  return (
    <div
      ref={containerRef}
      className={cn("group/slider relative h-full w-full touch-none select-none", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      // PhotoLightbox listens for touchstart/touchend on itself to swipe
      // between photos — without stopping propagation here, dragging the
      // handle on a touch device would also register as a photo-swipe
      // and fire onIndexChange mid-comparison.
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
    >
      {/* Base layer — always fully visible. */}
      <Image src={beforeSrc} alt={beforeAlt} fill sizes={sizes} className="pointer-events-none object-contain" />

      {/* Overlay layer — clipped to reveal only the portion left of the handle. */}
      <div
        ref={afterLayerRef}
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={afterSrc} alt={afterAlt} fill sizes={sizes} className="object-contain" />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-cream/90 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-cream/90 backdrop-blur-sm">
        {afterLabel}
      </span>

      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={`${beforeLabel} / ${afterLabel} müqayisəsi`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% ${afterLabel.toLowerCase()}`}
        onKeyDown={handleKeyDown}
        className="absolute top-0 bottom-0 z-10 flex -translate-x-1/2 cursor-ew-resize items-center justify-center outline-none"
        style={{ left: `${position}%` }}
      >
        <div className="h-full w-px bg-cream/80" aria-hidden="true" />
        <div
          className="absolute grid h-9 w-9 place-items-center rounded-full bg-cream text-ink opacity-90 shadow-md ring-2 ring-transparent transition-all duration-150 group-hover/slider:opacity-100 group-hover/slider:scale-105 focus-visible:opacity-100 focus-visible:ring-forest-light"
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path d="M7.5 5 3.5 10l4 5M12.5 5l4 5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
