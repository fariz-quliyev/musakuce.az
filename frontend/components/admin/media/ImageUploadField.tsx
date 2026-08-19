"use client";

import { useRef, useState } from "react";
import { mediaApi } from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { ImageCropper } from "./ImageCropper";
import type { MediaAssetDto } from "@/lib/api/types";

type Props = {
  label: string;
  initialPreviewUrl?: string | null;
  onUploaded: (media: MediaAssetDto) => void;
  /** Uses the anonymous /api/media/community-upload endpoint instead of
   * the admin-privileged one — for the public /paylas form. */
  community?: boolean;
  required?: boolean;
  hint?: string;
  /** Opt-in (Phase — People admin UX pass): when provided, a "Şəkli sil"
   * action appears once there's a preview (existing or newly-selected),
   * clearing it and calling this. Every existing caller that doesn't
   * pass it renders exactly as before — this changes nothing by
   * default. */
  onRemove?: () => void;
  /** Opt-in: fires `true` right before the upload starts and `false`
   * once it settles (success or error) — lets the parent form disable
   * its own submit while a photo is still uploading, so a fast "Yadda
   * saxla" click can't save the record before the just-selected image
   * is actually attached (the upload is async; onUploaded — and thus
   * the parent's coverMediaAssetId — only arrives after it resolves).
   * Every existing caller that doesn't pass it is unaffected. */
  onUploadingChange?: (uploading: boolean) => void;
  /** Opt-in: overrides the preview box's aspect ratio (Tailwind class,
   * e.g. "aspect-[3/4]"). Defaults to the original "aspect-video" (16:9)
   * every existing caller already renders at. Without this, a caller
   * whose final public display crops to a different ratio than 16:9
   * (e.g. the People form's portrait 3:4 cards) shows the admin a
   * preview crop that doesn't match what actually ends up on the site —
   * this lets that caller's preview match its real target ratio. */
  previewAspectClassName?: string;
  /** Opt-in: when set, a newly-selected file goes through an inline
   * crop step (drag to pan, wheel/slider to zoom) before uploading,
   * instead of uploading immediately — added because relying only on
   * automatic center-cropping (`object-cover`) sometimes cuts off the
   * actual subject on a source photo that isn't already close to the
   * target ratio. Value is width/height, e.g. 3/4. Every existing
   * caller that doesn't pass it uploads exactly as before. */
  cropAspectRatio?: number;
};

/**
 * Real upload widget (Phase 8) — replaces the old "paste an image URL"
 * text input everywhere it's used. Shows a live preview, an upload
 * progress bar, and clear success/error states. On success, hands the
 * resulting MediaAssetDto to the parent form via onUploaded; the parent
 * is responsible for including its `id` in the eventual form submission.
 */
export function ImageUploadField({
  label,
  initialPreviewUrl,
  onUploaded,
  community,
  required,
  hint,
  onRemove,
  onUploadingChange,
  previewAspectClassName,
  cropAspectRatio,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (cropAspectRatio) {
      setCropFile(file);
      return;
    }
    void startUpload(file);
  }

  async function startUpload(file: File) {
    setStatus("uploading");
    setProgress(0);
    setError(null);
    onUploadingChange?.(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const media = await (community ? mediaApi.uploadCommunity(file, setProgress) : mediaApi.uploadAdmin(file, setProgress));
      setStatus("success");
      setPreviewUrl(media.url);
      onUploaded(media);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Yükləmə uğursuz oldu.");
    } finally {
      URL.revokeObjectURL(localPreview);
      onUploadingChange?.(false);
    }
  }

  function resetFileInput() {
    // Without this, re-selecting the exact same file right after
    // removing/cancelling it wouldn't fire another change event (the
    // input's own value wouldn't have changed).
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setPreviewUrl(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    resetFileInput();
    onRemove?.();
  }

  const showRemove = !!onRemove && !!previewUrl && status !== "uploading";

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-terracotta">*</span> : null}
      </label>

      {cropFile ? (
        <ImageCropper
          file={cropFile}
          aspectRatio={cropAspectRatio ?? 1}
          onConfirm={(cropped) => {
            setCropFile(null);
            void startUpload(cropped);
          }}
          onCancel={() => {
            setCropFile(null);
            resetFileInput();
          }}
          onError={(message) => {
            setCropFile(null);
            resetFileInput();
            setStatus("error");
            setError(message);
          }}
        />
      ) : (
        <>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- transient local blob:/remote preview during upload, not a final optimized display
            <img
              src={previewUrl}
              alt=""
              className={cn(
                previewAspectClassName ?? "aspect-video",
                "w-full max-w-sm rounded-md border border-stone-light bg-paper-soft object-cover",
              )}
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileChange}
              className="text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink-on-dark file:transition-colors hover:file:bg-forest-dark"
            />
            {showRemove ? (
              <button type="button" onClick={handleRemove} className="text-xs font-medium text-danger hover:underline">
                Şəkli sil
              </button>
            ) : null}
          </div>
          {onRemove && previewUrl && status === "idle" ? (
            <p className="text-xs text-ink-faint">Dəyişmək üçün yuxarıdan yeni fayl seçin.</p>
          ) : null}
          {hint && status === "idle" ? <p className="text-xs text-ink-faint">{hint}</p> : null}

          {status === "uploading" ? (
            <div className="flex max-w-sm items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-light">
                <div className="h-full bg-forest transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-ink-faint">{progress}%</span>
            </div>
          ) : null}

          {status === "success" ? <p className="text-xs font-medium text-success">Yükləndi.</p> : null}
          {status === "error" ? <p className="text-xs font-medium text-danger">{error}</p> : null}
        </>
      )}
    </div>
  );
}
