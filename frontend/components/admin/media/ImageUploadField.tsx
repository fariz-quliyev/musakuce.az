"use client";

import { useRef, useState } from "react";
import { mediaApi } from "@/lib/api/media";
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
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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

  function handleRemove() {
    setPreviewUrl(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    // Without this, re-selecting the exact same file right after
    // removing it wouldn't fire another change event (the input's own
    // value wouldn't have changed).
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  }

  const showRemove = !!onRemove && !!previewUrl && status !== "uploading";

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-terracotta">*</span> : null}
      </label>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- transient local blob:/remote preview during upload, not a final optimized display
        <img
          src={previewUrl}
          alt=""
          className="aspect-video w-full max-w-sm rounded-md border border-stone-light bg-paper-soft object-cover"
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
    </div>
  );
}
