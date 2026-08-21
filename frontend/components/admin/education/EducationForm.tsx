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
import { RichTextEditor } from "@/components/admin/shared/RichTextEditor";
import { PublicationStatusPicker, type PublicationChoice } from "@/components/admin/shared/PublicationStatusPicker";
import { describeSaveError } from "@/components/admin/shared/describeSaveError";
import { educationApi } from "@/lib/api/education";
import { educationKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { EducationEntryDto, EducationKind, MediaAssetDto, PublicationStatus, SourceStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(educationKindLabels) as [EducationKind, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

type Props = {
  entry?: EducationEntryDto;
  personOptions: { id: string; name: string }[];
};

export function EducationForm({ entry, personOptions }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(entry?.coverMediaAssetId ?? null);
  // A brand-new entry is always created as Draft (the domain default) —
  // an existing Archived entry defaults to "Draft" here too, since
  // Archived isn't one of this picker's two choices; picking either
  // option still moves it to a real, intentional state.
  const [publicationChoice, setPublicationChoice] = useState<PublicationChoice>(
    entry?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!entry;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const form = new FormData(event.currentTarget);
    const contentHtml = String(form.get("content") ?? "");

    // The editor is a contenteditable, not a native input, so the old
    // `<textarea maxLength={8000}>` constraint can't reach it — this
    // replaces it, checked against the same limit the backend actually
    // validates against (EducationEntryConfiguration.cs/EducationValidators.cs,
    // raised 8000 -> 16000 alongside the inline-image button, same
    // reasoning as PersonForm's biography: an <img> tag alone costs
    // ~120-170 chars).
    if (contentHtml.length > 16000) {
      setStatus("error");
      setErrorMessage(`Tam mətn çox uzundur (${contentHtml.length}/16000 simvol, formatlaşdırma və şəkillər daxil). Mətni qısaldın.`);
      return;
    }

    setStatus("submitting");

    const payload = {
      title: String(form.get("title") ?? ""),
      kind: form.get("kind") as EducationKind,
      summary: String(form.get("summary") ?? "") || null,
      content: contentHtml || null,
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
      let entryId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await educationApi.update(entry.id, payload);
        entryId = entry.id;
        currentStatus = entry.publicationStatus;
      } else {
        const created = await educationApi.create(payload);
        entryId = created.id;
        currentStatus = created.publicationStatus;
      }

      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await educationApi.updateStatus(entryId, { publicationStatus: publicationChoice });
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
      router.push(`/admin/tehsil/${entryId}/redakte?s=${finalStatus}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
    }
  }

  return (
    <AdminFormContainer onSubmit={handleSubmit}>
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

      <FormField label="Tam mətn" htmlFor="content" hint="Boş buraxıla bilər — maks. 16000 simvol (formatlaşdırma teqləri və şəkillər daxil)" className="min-w-0">
        <RichTextEditor id="content" name="content" initialContent={entry?.content ?? ""} allowImages />
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
        onRemove={() => setCoverMediaAssetId(null)}
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

      {/* Əməliyyatlar — sticky so "Yadda saxla" stays reachable without
          hunting for it at the bottom of a long form, matching PersonForm
          (the reference for this status-management pattern). */}
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

          <Button type="button" variant="outline" href="/admin/tehsil">
            Ləğv et
          </Button>
        </div>
      </div>
    </AdminFormContainer>
  );
}
