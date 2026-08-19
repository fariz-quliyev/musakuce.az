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
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { culturalHeritageKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { CulturalHeritageItemDto, CulturalHeritageKind, MediaAssetDto, PublicationStatus, SourceStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(culturalHeritageKindLabels) as [CulturalHeritageKind, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function CulturalHeritageForm({ item }: { item?: CulturalHeritageItemDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(item?.coverMediaAssetId ?? null);
  const [publicationChoice, setPublicationChoice] = useState<PublicationChoice>(
    item?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!item;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      kind: form.get("kind") as CulturalHeritageKind,
      description: String(form.get("description") ?? ""),
      coverMediaAssetId,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      editorialNote: String(form.get("editorialNote") ?? "") || null,
      originalSourceText: String(form.get("originalSourceText") ?? "") || null,
    };

    try {
      let itemId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await culturalHeritageApi.update(item.id, payload);
        itemId = item.id;
        currentStatus = item.publicationStatus;
      } else {
        const created = await culturalHeritageApi.create(payload);
        itemId = created.id;
        currentStatus = created.publicationStatus;
      }

      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await culturalHeritageApi.updateStatus(itemId, { publicationStatus: publicationChoice });
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
      router.push(`/admin/medeni-iras/${itemId}/redakte?s=${finalStatus}`);
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
          <Input id="title" name="title" required maxLength={150} defaultValue={item?.title} />
        </FormField>
        <FormField label="Növ" htmlFor="kind" required>
          <Select id="kind" name="kind" defaultValue={item?.kind ?? "Tradition"} required>
            {KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Təsvir" htmlFor="description" required>
        <Textarea id="description" name="description" required maxLength={4000} defaultValue={item?.description} />
      </FormField>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={item?.coverImageUrl}
        onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={item?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mənbə/istinad" htmlFor="sourceReference" hint="Boş buraxıla bilər">
          <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={item?.sourceReference ?? ""} />
        </FormField>
      </div>

      <FormField label="Redaktor qeydi" htmlFor="editorialNote" hint="Yalnız admin panelində görünür">
        <Textarea id="editorialNote" name="editorialNote" maxLength={2000} defaultValue={item?.editorialNote ?? ""} />
      </FormField>

      <FormField label="Orijinal mənbə mətni" htmlFor="originalSourceText" hint="Yalnız admin panelində görünür">
        <Textarea id="originalSourceText" name="originalSourceText" maxLength={8000} defaultValue={item?.originalSourceText ?? ""} />
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

          <Button type="button" variant="outline" href="/admin/medeni-iras">
            Ləğv et
          </Button>
        </div>
      </div>
    </form>
  );
}
