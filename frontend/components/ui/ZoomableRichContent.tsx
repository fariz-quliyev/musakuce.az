"use client";

import { useEffect, useRef, useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  /** Already-sanitized HTML (via `sanitizeRichText`) — this component
   * never sanitizes anything itself, it only adds click-to-zoom on top
   * of a string the caller has already made safe to render. */
  html: string;
  className?: string;
};

/**
 * Renders a block of rich-text content (Education.content,
 * Person.biography) and makes every inline <img> inside it
 * click-to-zoom via the same `ImageLightbox` the detail-page cover
 * photos use (see `ZoomableImage`). `dangerouslySetInnerHTML` content
 * isn't React elements, so individual `<img>` tags can't be wrapped in
 * a `<button>` the way `ZoomableImage` wraps a real `VillagePhoto` —
 * this instead delegates click/keyboard handling on the container and
 * tags each `<img>` as a keyboard-focusable button role after mount.
 * Needs its own "use client" boundary for that handler; the sanitized
 * HTML itself is still produced exactly once, server-side, by the
 * caller — this component only ever receives and renders that string.
 */
export function ZoomableRichContent({ html, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const images = containerRef.current?.querySelectorAll("img") ?? [];
    images.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `${img.alt || "Şəkil"} — böyüt`);
    });
  }, [html]);

  function openIfImage(target: EventTarget | null) {
    if (target instanceof HTMLImageElement) {
      setZoom({ src: target.currentSrc || target.src, alt: target.alt });
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        onClick={(event) => openIfImage(event.target)}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLImageElement) {
            event.preventDefault();
            openIfImage(event.target);
          }
        }}
        // Sanitized by the caller (sanitizeRichText) before it ever
        // reaches this prop — see the `html` doc comment above.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {zoom ? <ImageLightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} /> : null}
    </>
  );
}
