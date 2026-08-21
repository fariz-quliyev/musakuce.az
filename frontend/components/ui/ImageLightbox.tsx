"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

/**
 * Minimal single-image lightbox — click-to-zoom for a detail page's
 * cover photo (Təhsil, İnsanlarımız, Mədəni irs, Xatirə, Təqvim,
 * Elanlar). Deliberately simpler than `PhotoLightbox` (no prev/next
 * paging, no caption body): that one is purpose-built for browsing the
 * /fotoalbom grid's `PhotoDto[]`, this one just shows one already-known
 * image bigger. Same accessibility shape (focus the close button on
 * open, Escape to close, restore body scroll) so both behave
 * consistently across the site.
 */
export function ImageLightbox({ src, alt, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Bağla"
        className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full text-cream/90 transition-colors hover:bg-cream/10"
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* stopPropagation: clicking the image itself shouldn't close —
          only the backdrop behind it should. */}
      <div className="relative h-full max-h-[85vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <Image src={src} alt={alt} fill sizes="90vw" className="object-contain" />
      </div>
    </div>
  );
}
