"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  file: File;
  /** width / height, e.g. 3/4 for a portrait crop — matches whatever
   * the eventual public display actually crops to. */
  aspectRatio: number;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

const VIEWPORT_WIDTH = 288;
const OUTPUT_LONG_SIDE = 1600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type Offset = { x: number; y: number };

/**
 * Lets the admin choose exactly which part of an uploaded photo becomes
 * the site's fixed-aspect crop, instead of leaving it entirely to
 * automatic center-cropping (`object-cover` on the public pages) —
 * added because a centered auto-crop can cut off the actual subject on
 * a source photo that isn't already close to the target ratio. Pans by
 * dragging (pointer events, so mouse/touch/pen all work the same way)
 * and zooms via the wheel or the slider; "Kəsib təsdiqlə" renders the
 * currently-visible region onto a canvas at a fixed output resolution
 * and hands the caller a real `File` (JPEG), so the rest of the upload
 * pipeline — ImageUploadField's existing progress/error handling, the
 * backend's media upload endpoint — needs no changes at all.
 */
export function ImageCropper({ file, aspectRatio, onConfirm, onCancel, onError }: Props) {
  const viewportHeight = Math.round(VIEWPORT_WIDTH / aspectRatio);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Create and revoke together inside the same effect run — not split
  // across a `useState` initializer (runs once, ever) and a separate
  // cleanup effect. React's Strict Mode dev double-invoke (mount →
  // cleanup → mount again) would otherwise revoke the URL on the
  // simulated unmount without ever creating a fresh one for the real
  // mount that follows, leaving the <img> pointed at a dead blob: URL
  // (observed as net::ERR_FILE_NOT_FOUND and a false "corrupt file"
  // error). Keeping create+revoke paired per effect run means the
  // second (real) invocation mints its own URL correctly.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = naturalSize ? Math.max(VIEWPORT_WIDTH / naturalSize.w, viewportHeight / naturalSize.h) : 1;
  const scale = baseScale * zoom;
  const dispW = naturalSize ? naturalSize.w * scale : 0;
  const dispH = naturalSize ? naturalSize.h * scale : 0;

  function clampOffset(next: Offset, w: number, h: number): Offset {
    const minX = Math.min(0, VIEWPORT_WIDTH - w);
    const minY = Math.min(0, viewportHeight - h);
    return { x: Math.min(0, Math.max(minX, next.x)), y: Math.min(0, Math.max(minY, next.y)) };
  }

  function centerAt(w: number, h: number) {
    setOffset(clampOffset({ x: (VIEWPORT_WIDTH - w) / 2, y: (viewportHeight - h) / 2 }, w, h));
  }

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) {
      onError("Şəkil oxuna bilmədi. Fayl zədəli ola bilər.");
      return;
    }
    setNaturalSize({ w, h });
    const initialScale = Math.max(VIEWPORT_WIDTH / w, viewportHeight / h);
    setZoom(1);
    centerAt(w * initialScale, h * initialScale);
  }

  function setZoomPreservingCenter(nextZoom: number) {
    if (!naturalSize) return;
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    const nextScale = baseScale * clampedZoom;
    // Image-local point currently shown at the viewport's center — kept
    // fixed across the zoom change so zooming feels anchored, not like
    // it jumps to a new spot.
    const cx = (VIEWPORT_WIDTH / 2 - offset.x) / scale;
    const cy = (viewportHeight / 2 - offset.y) / scale;
    const nextW = naturalSize.w * nextScale;
    const nextH = naturalSize.h * nextScale;
    setZoom(clampedZoom);
    setOffset(clampOffset({ x: VIEWPORT_WIDTH / 2 - cx * nextScale, y: viewportHeight / 2 - cy * nextScale }, nextW, nextH));
  }

  function handlePointerDown(event: React.PointerEvent) {
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startY: event.clientY, startOffset: offset };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;
    function onMove(event: PointerEvent) {
      if (!dragRef.current) return;
      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      setOffset(clampOffset({ x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy }, dispW, dispH));
    }
    function onUp() {
      setDragging(false);
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // dispW/dispH change during a drag would fight the in-progress
    // gesture's own clamping — only dragging start/stop should re-bind.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    setZoomPreservingCenter(zoom - event.deltaY * 0.0015);
  }

  function handleReset() {
    if (!naturalSize) return;
    setZoom(1);
    centerAt(naturalSize.w * baseScale, naturalSize.h * baseScale);
  }

  function handleConfirm() {
    if (!naturalSize || !imgRef.current) return;
    const outputW = aspectRatio <= 1 ? Math.round(OUTPUT_LONG_SIDE * aspectRatio) : OUTPUT_LONG_SIDE;
    const outputH = aspectRatio <= 1 ? OUTPUT_LONG_SIDE : Math.round(OUTPUT_LONG_SIDE / aspectRatio);
    const canvas = document.createElement("canvas");
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onError("Kəsmə uğursuz oldu.");
      return;
    }
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sWidth = VIEWPORT_WIDTH / scale;
    const sHeight = viewportHeight / scale;
    ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, outputW, outputH);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onError("Kəsmə uğursuz oldu.");
          return;
        }
        const baseName = file.name.replace(/\.[^./\\]+$/, "") || "shekil";
        onConfirm(new File([blob], `${baseName}-kesilmis.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="grid gap-3 rounded-md border border-stone-light bg-paper-soft p-3">
      <div
        className="relative mx-auto touch-none overflow-hidden rounded-md border border-stone bg-ink/5"
        style={{ width: VIEWPORT_WIDTH, height: viewportHeight, cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        {objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- draggable crop-source preview, drawn to canvas on confirm, never a final optimized display
          <img
            ref={imgRef}
            src={objectUrl}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            onError={() => onError("Şəkil oxuna bilmədi. Fayl zədəli ola bilər.")}
            className="absolute max-w-none select-none"
            style={naturalSize ? { width: dispW, height: dispH, left: offset.x, top: offset.y } : { opacity: 0 }}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="crop-zoom" className="text-xs whitespace-nowrap text-ink-faint">
          Yaxınlaşdırma
        </label>
        <input
          id="crop-zoom"
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          disabled={!naturalSize}
          onChange={(event) => setZoomPreservingCenter(Number(event.target.value))}
          className="flex-1"
        />
        <button type="button" onClick={handleReset} className="text-xs font-medium text-ink-soft hover:underline">
          Sıfırla
        </button>
      </div>

      <p className="text-xs text-ink-faint">Kadrı sürükləyərək mövqeyini dəyişin, sürüşdürücü (və ya siçan çarxı) ilə yaxınlaşdırın.</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!naturalSize}
          className="rounded-md bg-forest px-3 py-2 text-sm font-semibold text-ink-on-dark transition-colors hover:bg-forest-dark disabled:opacity-50"
        >
          Kəsib təsdiqlə
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-stone-light px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper"
        >
          Ləğv et
        </button>
      </div>
    </div>
  );
}
