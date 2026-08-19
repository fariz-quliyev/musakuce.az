"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { AdminFormContainer } from "@/components/admin/shared/AdminFormContainer";
import { PublicationStatusPicker, type PublicationChoice } from "@/components/admin/shared/PublicationStatusPicker";
import { describeSaveError } from "@/components/admin/shared/describeSaveError";
import { localInfoApi } from "@/lib/api/localInfo";
import { localInfoKindLabels } from "@/lib/api/labels";
import type { LocalInfoEntryDto, LocalInfoKind, MediaAssetDto, PublicationStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(localInfoKindLabels) as [LocalInfoKind, string][];

export function LocalInfoForm({ entry }: { entry?: LocalInfoEntryDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoMediaAssetId, setPhotoMediaAssetId] = useState<string | null>(entry?.photoMediaAssetId ?? null);
  const [publicationChoice, setPublicationChoice] = useState<PublicationChoice>(
    entry?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!entry;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      kind: form.get("kind") as LocalInfoKind,
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "") || null,
      contactInfo: String(form.get("contactInfo") ?? "") || null,
      areaServed: String(form.get("areaServed") ?? "") || null,
      photoMediaAssetId,
      attachedToEntryId: String(form.get("attachedToEntryId") ?? "") || null,
    };

    try {
      let entryId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await localInfoApi.update(entry.id, payload);
        entryId = entry.id;
        currentStatus = entry.publicationStatus;
      } else {
        const created = await localInfoApi.create(payload);
        entryId = created.id;
        currentStatus = created.publicationStatus;
      }

      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await localInfoApi.updateStatus(entryId, { publicationStatus: publicationChoice });
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
      router.push(`/admin/faydali-melumatlar/${entryId}/redakte?s=${finalStatus}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
    }
  }

  return (
    <AdminFormContainer onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Ad" htmlFor="name" required>
          <Input id="name" name="name" required maxLength={150} defaultValue={entry?.name} />
        </FormField>
        <FormField label="Növ" htmlFor="kind" required>
          <Select id="kind" name="kind" defaultValue={entry?.kind ?? "Service"} required>
            {KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Kateqoriya" htmlFor="category" required hint="Sərbəst mətn — məs. 'Santexnik', 'Aptek'">
        <Input id="category" name="category" required maxLength={100} defaultValue={entry?.category} />
      </FormField>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" maxLength={2000} defaultValue={entry?.description ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Əlaqə" htmlFor="contactInfo" hint="Boş buraxıla bilər">
          <Input id="contactInfo" name="contactInfo" maxLength={200} defaultValue={entry?.contactInfo ?? ""} />
        </FormField>
        <FormField label="Əhatə etdiyi ərazi" htmlFor="areaServed" hint="Boş buraxıla bilər">
          <Input id="areaServed" name="areaServed" maxLength={200} defaultValue={entry?.areaServed ?? ""} />
        </FormField>
      </div>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={entry?.photoUrl}
        onUploaded={(media: MediaAssetDto) => setPhotoMediaAssetId(media.id)}
        hint="Boş buraxıla bilər — JPEG, PNG, WebP və ya AVIF, maks. 15 MB"
      />

      <FormField
        label="Bağlı olduğu qeyd (ID)"
        htmlFor="attachedToEntryId"
        hint="Yalnız 'Tövsiyə' mövcud bir qeydə əlavə edildikdə — həmin qeydin ID-si"
      >
        <Input id="attachedToEntryId" name="attachedToEntryId" defaultValue={entry?.attachedToEntryId ?? ""} />
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

          <Button type="button" variant="outline" href="/admin/faydali-melumatlar">
            Ləğv et
          </Button>
        </div>
      </div>
    </AdminFormContainer>
  );
}
