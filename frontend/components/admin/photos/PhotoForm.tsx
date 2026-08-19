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
import { photosApi } from "@/lib/api/photos";
import { photoCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PhotoCategory, PhotoDto, PublicationStatus, SourceStatus } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(photoCategoryLabels) as [PhotoCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function PhotoForm({ photo }: { photo?: PhotoDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(photo?.mediaAssetId ?? null);
  const [publicationChoice, setPublicationChoice] = useState<PublicationChoice>(
    photo?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!photo;

  function handleUploaded(media: MediaAssetDto) {
    setMediaAssetId(media.id);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mediaAssetId) return;

    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      takenDate: String(form.get("takenDate") ?? "") || null,
      location: String(form.get("location") ?? "") || null,
      description: String(form.get("description") ?? "") || null,
      story: String(form.get("story") ?? "") || null,
      category: form.get("category") as PhotoCategory,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      uploaderName: String(form.get("uploaderName") ?? "") || null,
      mediaAssetId,
      altText: String(form.get("altText") ?? "") || null,
    };

    try {
      let photoId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await photosApi.update(photo.id, payload);
        photoId = photo.id;
        currentStatus = photo.publicationStatus;
      } else {
        const created = await photosApi.create(payload);
        photoId = created.id;
        currentStatus = created.publicationStatus;
      }

      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await photosApi.updateStatus(photoId, { publicationStatus: publicationChoice });
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
      router.push(`/admin/fotoalbom/${photoId}/redakte?s=${finalStatus}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Başlıq" htmlFor="title" required>
          <Input id="title" name="title" required maxLength={150} defaultValue={photo?.title} />
        </FormField>
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue={photo?.category ?? "KendHeyati"} required>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={photo?.imageUrl}
        onUploaded={handleUploaded}
        required={!isEdit}
        hint={isEdit ? "Dəyişməsəniz mövcud şəkil saxlanılacaq" : "JPEG, PNG, WebP və ya AVIF — maks. 15 MB"}
      />

      <FormField label="Alternativ mətn (alt text)" htmlFor="altText" required hint="Ekran oxuyucuları üçün şəklin qısa təsviri">
        <Input id="altText" name="altText" required maxLength={300} defaultValue={photo?.altText ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Çəkiliş tarixi" htmlFor="takenDate" hint="Boş buraxıla bilər">
          <Input id="takenDate" name="takenDate" type="date" defaultValue={photo?.takenDate ?? ""} />
        </FormField>
        <FormField label="Yer" htmlFor="location" hint="Boş buraxıla bilər">
          <Input id="location" name="location" maxLength={200} defaultValue={photo?.location ?? ""} />
        </FormField>
      </div>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" defaultValue={photo?.description ?? ""} />
      </FormField>

      <FormField label="Hekayə" htmlFor="story" hint="Boş buraxıla bilər — 'Bir foto, bir hekayə' üçün">
        <Textarea id="story" name="story" defaultValue={photo?.story ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Fotoqraf/mənbə" htmlFor="uploaderName" hint="Boş buraxıla bilər">
          <Input id="uploaderName" name="uploaderName" maxLength={150} defaultValue={photo?.uploaderName ?? ""} />
        </FormField>
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={photo?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {!mediaAssetId ? (
        <p className="text-sm font-medium text-warning">Davam etmək üçün şəkil yükləyin.</p>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-5 rounded-t-lg border-t border-stone-light bg-paper/95 px-5 py-4 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:border">
        {status === "success" ? (
          <p className="mb-3 text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
        ) : null}
        {status === "error" ? (
          <p className="mb-3 text-sm font-medium text-danger">{errorMessage}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={status === "submitting"} disabled={!mediaAssetId}>
            Yadda saxla
          </Button>

          <PublicationStatusPicker value={publicationChoice} onChange={setPublicationChoice} />

          <Button type="button" variant="outline" href="/admin/fotoalbom">
            Ləğv et
          </Button>
        </div>
      </div>
    </form>
  );
}
