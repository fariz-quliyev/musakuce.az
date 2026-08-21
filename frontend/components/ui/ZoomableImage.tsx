"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Click-to-zoom wrapper for any already-rendered image (a `VillagePhoto`,
 * typically) — opens `ImageLightbox` on click without changing the
 * wrapped image's normal display size/crop at all. Deliberately generic
 * (wraps `children` rather than rendering its own `<img>`) so it drops
 * around any content detail page's cover photo without duplicating
 * `VillagePhoto`'s own placeholder/next-image logic — only where a real
 * `src` exists (a caller shouldn't wrap a `PhotoPlaceholder`).
 * `VillagePhoto` itself stays a plain, non-"use client" component so
 * every non-zoomable usage across the site (list/grid thumbnails)
 * is unaffected.
 */
export function ZoomableImage({ src, alt, children, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} — böyüt`}
        className={cn("block h-full w-full cursor-zoom-in text-left", className)}
      >
        {children}
      </button>
      {open ? <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
