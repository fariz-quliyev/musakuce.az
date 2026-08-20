"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { photoCategoryLabels } from "@/lib/api/labels";
import type { PhotoDto } from "@/lib/api/types";

type Props = {
  photos: PhotoDto[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Full-screen photo viewer for /fotoalbom — opened from PhotosBrowser's
 * grid. Only the active photo's full-size image is ever mounted (the
 * grid thumbnails stay lazy-loaded next/image as before), so paging
 * through an album never pulls every photo's full resolution up front.
 * Prev/Next stay within the caller's already-fetched page of results —
 * crossing a page boundary closes the lightbox back to the grid rather
 * than silently fetching more photos behind it.
 */
export function PhotoLightbox({ photos, index, onClose, onIndexChange }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      else if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, hasPrev, hasNext, onClose, onIndexChange]);

  if (!photo) return null;

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    const SWIPE_THRESHOLD = 48;
    if (deltaX > SWIPE_THRESHOLD && hasPrev) onIndexChange(index - 1);
    else if (deltaX < -SWIPE_THRESHOLD && hasNext) onIndexChange(index + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} — foto ${index + 1}/${photos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="text-xs font-medium text-cream/70">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Bağla"
          className="grid h-10 w-10 place-items-center rounded-full text-cream/90 transition-colors hover:bg-cream/10"
        >
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 pb-2 sm:px-4">
        {hasPrev ? (
          <button
            type="button"
            onClick={() => onIndexChange(index - 1)}
            aria-label="Əvvəlki foto"
            className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream transition-colors hover:bg-ink/60 sm:left-4"
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M12.5 4.5 6 11l6.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}

        <div className="relative h-full max-h-[70vh] w-full max-w-4xl sm:max-h-[75vh]">
          {photo.imageUrl && photo.restoredImageUrl ? (
            <BeforeAfterSlider
              key={photo.id}
              beforeSrc={photo.imageUrl}
              afterSrc={photo.restoredImageUrl}
              beforeAlt={photo.altText ?? photo.title}
              afterAlt={`${photo.altText ?? photo.title} — bərpa edilmiş`}
            />
          ) : photo.imageUrl ? (
            <Image
              key={photo.id}
              src={photo.imageUrl}
              alt={photo.altText ?? photo.title}
              fill
              sizes="(min-width: 640px) 80vw, 96vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-ink-soft/20 text-sm text-cream/70">
              {photo.title}
            </div>
          )}
        </div>

        {hasNext ? (
          <button
            type="button"
            onClick={() => onIndexChange(index + 1)}
            aria-label="Növbəti foto"
            className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/40 text-cream transition-colors hover:bg-ink/60 sm:right-4"
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M7.5 4.5 14 11l-6.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 pb-6 sm:pb-8">
        <p className="font-display text-lg text-cream">{photo.title}</p>
        {photo.description || photo.story ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-cream/80">{photo.story ?? photo.description}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/60">
          <span>{photoCategoryLabels[photo.category]}</span>
          {photo.takenDate ? <span>{photo.takenDate}</span> : null}
          {photo.location ? <span>{photo.location}</span> : null}
        </div>
        <div className="mt-3">
          <SuggestionCta targetEntityType="Photo" targetEntityId={photo.id} tone="dark" />
        </div>
      </div>
    </div>
  );
}
