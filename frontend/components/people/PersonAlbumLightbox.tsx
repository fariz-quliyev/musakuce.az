"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type AlbumImage = { url: string; alt: string };

type Props = {
  images: AlbumImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Full-screen viewer for a Person's Fotoalbom — same mechanics as
 * `components/photos/PhotoLightbox.tsx` (focus-on-open, body-scroll-lock,
 * Escape/arrow-key/swipe navigation, only the active image's full
 * resolution ever mounted), kept as a separate, Person-scoped component
 * rather than generalizing PhotoLightbox itself: that component is
 * tightly coupled to PhotoDto's caption fields (title/description/
 * story/category/takenDate/location) for its footer, and this feature
 * never asked for a PhotoDto shape — a PersonImageDto has none of that,
 * so there's no caption footer here at all. Refactoring the shipped,
 * public /fotoalbom lightbox to accommodate a shape it was never built
 * for would be unrelated risk for a feature that doesn't need it.
 */
export function PersonAlbumLightbox({ images, index, onClose, onIndexChange }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

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

  if (!image) return null;

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
      aria-label={`${image.alt} — foto ${index + 1}/${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="text-xs font-medium text-cream/70">
          {index + 1} / {images.length}
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

      <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-4 sm:pb-8">
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

        <div className="relative h-full max-h-[80vh] w-full max-w-4xl">
          <Image key={image.url} src={image.url} alt={image.alt} fill sizes="(min-width: 640px) 80vw, 96vw" className="object-contain" />
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
    </div>
  );
}
