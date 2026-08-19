"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { PublicationStatusPicker, type PublicationChoice } from "@/components/admin/shared/PublicationStatusPicker";
import { describeSaveError } from "@/components/admin/shared/describeSaveError";
import { videosApi } from "@/lib/api/videos";
import { sourceStatusLabels, videoEmbedProviderLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PublicationStatus, SourceStatus, VideoDto, VideoEmbedProvider } from "@/lib/api/types";

const PROVIDER_OPTIONS = Object.entries(videoEmbedProviderLabels) as [VideoEmbedProvider, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function VideoForm({ video }: { video?: VideoDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [thumbnailMediaAssetId, setThumbnailMediaAssetId] = useState<string | null>(video?.thumbnailMediaAssetId ?? null);
  const [publicationChoice, setPublicationChoice] = useState<PublicationChoice>(
    video?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!video;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? "") || null,
      embedProvider: form.get("embedProvider") as VideoEmbedProvider,
      embedUrlOrKey: String(form.get("embedUrlOrKey") ?? ""),
      thumbnailMediaAssetId,
      category: String(form.get("category") ?? "") || null,
      recordedDate: String(form.get("recordedDate") ?? "") || null,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
    };

    try {
      let videoId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await videosApi.update(video.id, payload);
        videoId = video.id;
        currentStatus = video.publicationStatus;
      } else {
        const created = await videosApi.create(payload);
        videoId = created.id;
        currentStatus = created.publicationStatus;
      }

      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await videosApi.updateStatus(videoId, { publicationStatus: publicationChoice });
          finalStatus = updated.publicationStatus;
        } catch (statusErr) {
          statusErrorMessage = describeSaveError(statusErr);
        }
      }

      if (statusErrorMessage) {
        setStatus("error");
        setErrorMessage(`Məlumat saxlanıldı, lakin status yenilənmədi: ${statusErrorMessage}`);
      } else {
        setStatus("success");
      }
      router.push(`/admin/videolar/${videoId}/redakte?s=${finalStatus}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-5">
      <FormField label="Başlıq" htmlFor="title" required>
        <Input id="title" name="title" required maxLength={150} defaultValue={video?.title} />
      </FormField>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" defaultValue={video?.description ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Provayder" htmlFor="embedProvider" required>
          <Select id="embedProvider" name="embedProvider" defaultValue={video?.embedProvider ?? "YouTube"} required>
            {PROVIDER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Video URL / açar" htmlFor="embedUrlOrKey" required>
          <Input id="embedUrlOrKey" name="embedUrlOrKey" required defaultValue={video?.embedUrlOrKey} />
        </FormField>
      </div>

      <ImageUploadField
        label="Ön izləmə şəkli (thumbnail)"
        initialPreviewUrl={video?.thumbnailUrl}
        onUploaded={(media: MediaAssetDto) => setThumbnailMediaAssetId(media.id)}
        hint="Boş buraxıla bilər — JPEG, PNG, WebP və ya AVIF, maks. 15 MB"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Kateqoriya" htmlFor="category" hint="Boş buraxıla bilər — sərbəst mətn">
          <Input id="category" name="category" maxLength={100} defaultValue={video?.category ?? ""} />
        </FormField>
        <FormField label="Çəkiliş tarixi" htmlFor="recordedDate" hint="Boş buraxıla bilər">
          <Input id="recordedDate" name="recordedDate" type="date" defaultValue={video?.recordedDate ?? ""} />
        </FormField>
      </div>

      <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
        <Select id="sourceStatus" name="sourceStatus" defaultValue={video?.sourceStatus ?? "UnderResearch"} required>
          {SOURCE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="sticky bottom-0 z-10 -mx-5 rounded-t-lg border-t border-stone-light bg-paper/95 px-5 py-4 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:border">
        {status === "success" ? (
          <p className="mb-3 text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
        ) : null}
        {status === "error" ? (
          <p className="mb-3 text-sm font-medium text-danger">{errorMessage}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={status === "submitting"}>
            Yadda saxla
          </Button>

          <PublicationStatusPicker value={publicationChoice} onChange={setPublicationChoice} />

          <Button type="button" variant="outline" href="/admin/videolar">
            Ləğv et
          </Button>
        </div>
      </div>
    </form>
  );
}
