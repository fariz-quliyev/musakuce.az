"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { educationApi } from "@/lib/api/education";
import { educationKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { EducationEntryDto, EducationKind, MediaAssetDto, SourceStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(educationKindLabels) as [EducationKind, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

type Props = {
  entry?: EducationEntryDto;
  personOptions: { id: string; name: string }[];
};

export function EducationForm({ entry, personOptions }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(entry?.coverMediaAssetId ?? null);
  const isEdit = !!entry;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      kind: form.get("kind") as EducationKind,
      summary: String(form.get("summary") ?? "") || null,
      content: String(form.get("content") ?? "") || null,
      period: String(form.get("period") ?? "") || null,
      eventDate: String(form.get("eventDate") ?? "") || null,
      coverMediaAssetId,
      relatedPersonId: String(form.get("relatedPersonId") ?? "") || null,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      editorialNote: String(form.get("editorialNote") ?? "") || null,
      originalSourceText: String(form.get("originalSourceText") ?? "") || null,
    };

    try {
      if (isEdit) {
        await educationApi.update(entry.id, payload);
        setStatus("success");
        router.push(`/admin/tehsil/${entry.id}/redakte?s=${entry.publicationStatus}`);
      } else {
        const created = await educationApi.create(payload);
        router.push(`/admin/tehsil/${created.id}/redakte?s=${created.publicationStatus}`);
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
          <Input id="title" name="title" required maxLength={150} defaultValue={entry?.title} />
        </FormField>
        <FormField label="Növ" htmlFor="kind" required>
          <Select id="kind" name="kind" defaultValue={entry?.kind ?? "SchoolHistory"} required>
            {KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Qısa xülasə" htmlFor="summary" hint="Boş buraxıla bilər — siyahı/kart görünüşündə istifadə olunur">
        <Textarea id="summary" name="summary" maxLength={500} defaultValue={entry?.summary ?? ""} />
      </FormField>

      <FormField label="Tam mətn" htmlFor="content" hint="Boş buraxıla bilər">
        <Textarea id="content" name="content" maxLength={8000} defaultValue={entry?.content ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Dövr" htmlFor="period" hint="Sərbəst mətn, məs. '1928' və ya '1962–1970'">
          <Input id="period" name="period" maxLength={50} defaultValue={entry?.period ?? ""} />
        </FormField>
        <FormField label="Dəqiq tarix" htmlFor="eventDate" hint="Boş buraxıla bilər">
          <Input id="eventDate" name="eventDate" type="date" defaultValue={entry?.eventDate ?? ""} />
        </FormField>
      </div>

      <FormField
        label="İnsanlarımız profili ilə əlaqələndir"
        htmlFor="relatedPersonId"
        hint="Tanınmış müəllim/məzun üçün — boş buraxıla bilər"
      >
        <Select id="relatedPersonId" name="relatedPersonId" defaultValue={entry?.relatedPersonId ?? ""}>
          <option value="">—</option>
          {personOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={entry?.coverImageUrl}
        onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={entry?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mənbə/istinad" htmlFor="sourceReference" hint="Boş buraxıla bilər">
          <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={entry?.sourceReference ?? ""} />
        </FormField>
      </div>

      <FormField label="Redaktor qeydi" htmlFor="editorialNote" hint="Yalnız admin panelində görünür">
        <Textarea id="editorialNote" name="editorialNote" maxLength={2000} defaultValue={entry?.editorialNote ?? ""} />
      </FormField>

      <FormField label="Orijinal mənbə mətni" htmlFor="originalSourceText" hint="Yalnız admin panelində görünür">
        <Textarea id="originalSourceText" name="originalSourceText" maxLength={8000} defaultValue={entry?.originalSourceText ?? ""} />
      </FormField>

      {status === "success" ? (
        <p className="text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/tehsil">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
