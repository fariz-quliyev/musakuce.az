"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { culturalHeritageKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { CulturalHeritageItemDto, CulturalHeritageKind, MediaAssetDto, SourceStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(culturalHeritageKindLabels) as [CulturalHeritageKind, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function CulturalHeritageForm({ item }: { item?: CulturalHeritageItemDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(item?.coverMediaAssetId ?? null);
  const isEdit = !!item;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
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
      if (isEdit) {
        await culturalHeritageApi.update(item.id, payload);
        router.push(`/admin/medeni-iras/${item.id}/redakte?s=${item.publicationStatus}`);
      } else {
        const created = await culturalHeritageApi.create(payload);
        router.push(`/admin/medeni-iras/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
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

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/medeni-iras">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
