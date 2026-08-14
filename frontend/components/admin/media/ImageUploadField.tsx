"use client";

import { useState } from "react";
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
};

/**
 * Real upload widget (Phase 8) — replaces the old "paste an image URL"
 * text input everywhere it's used. Shows a live preview, an upload
 * progress bar, and clear success/error states. On success, hands the
 * resulting MediaAssetDto to the parent form via onUploaded; the parent
 * is responsible for including its `id` in the eventual form submission.
 */
export function ImageUploadField({ label, initialPreviewUrl, onUploaded, community, required, hint }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setError(null);
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
    }
  }

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

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink-on-dark file:transition-colors hover:file:bg-forest-dark"
      />
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
