"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { memorialApi } from "@/lib/api/memorial";
import { memorialCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, MemorialCategory, MemorialRecordDto, SourceStatus } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(memorialCategoryLabels) as [MemorialCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

type Props = {
  record?: MemorialRecordDto;
  personOptions: { id: string; name: string }[];
};

export function MemorialForm({ record, personOptions }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(record?.coverMediaAssetId ?? null);
  const isEdit = !!record;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      fatherName: String(form.get("fatherName") ?? "") || null,
      category: form.get("category") as MemorialCategory,
      birthDate: String(form.get("birthDate") ?? "") || null,
      deathDate: String(form.get("deathDate") ?? "") || null,
      biography: String(form.get("biography") ?? "") || null,
      achievements: String(form.get("achievements") ?? "") || null,
      coverMediaAssetId,
      relatedPersonId: String(form.get("relatedPersonId") ?? "") || null,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      editorialNote: String(form.get("editorialNote") ?? "") || null,
      originalSourceText: String(form.get("originalSourceText") ?? "") || null,
    };

    try {
      if (isEdit) {
        await memorialApi.update(record.id, payload);
        router.push(`/admin/xatire/${record.id}/redakte?s=${record.publicationStatus}`);
      } else {
        const created = await memorialApi.create(payload);
        router.push(`/admin/xatire/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Ad, soyad" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" required maxLength={150} defaultValue={record?.fullName} />
        </FormField>
        <FormField label="Ata adı" htmlFor="fatherName" hint="Boş buraxıla bilər">
          <Input id="fatherName" name="fatherName" maxLength={100} defaultValue={record?.fatherName ?? ""} />
        </FormField>
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue={record?.category ?? "WWIIParticipant"} required>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Doğum tarixi" htmlFor="birthDate" hint="Boş buraxıla bilər">
          <Input id="birthDate" name="birthDate" type="date" defaultValue={record?.birthDate ?? ""} />
        </FormField>
        <FormField label="Vəfat tarixi" htmlFor="deathDate" hint="Boş buraxıla bilər">
          <Input id="deathDate" name="deathDate" type="date" defaultValue={record?.deathDate ?? ""} />
        </FormField>
      </div>

      <FormField label="Bioqrafiya" htmlFor="biography" hint="Boş buraxıla bilər">
        <Textarea id="biography" name="biography" maxLength={8000} defaultValue={record?.biography ?? ""} />
      </FormField>

      <FormField label="Nailiyyətlər" htmlFor="achievements" hint="Boş buraxıla bilər">
        <Textarea id="achievements" name="achievements" maxLength={4000} defaultValue={record?.achievements ?? ""} />
      </FormField>

      <FormField
        label="İnsanlarımız profili ilə əlaqələndir"
        htmlFor="relatedPersonId"
        hint="Bu şəxsin 'İnsanlarımız' bölməsində də profili varsa seçin — boş buraxıla bilər"
      >
        <Select id="relatedPersonId" name="relatedPersonId" defaultValue={record?.relatedPersonId ?? ""}>
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
        initialPreviewUrl={record?.coverImageUrl}
        onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={record?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mənbə/istinad" htmlFor="sourceReference" hint="Boş buraxıla bilər">
          <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={record?.sourceReference ?? ""} />
        </FormField>
      </div>

      <FormField label="Redaktor qeydi" htmlFor="editorialNote" hint="Yalnız admin panelində görünür">
        <Textarea id="editorialNote" name="editorialNote" maxLength={2000} defaultValue={record?.editorialNote ?? ""} />
      </FormField>

      <FormField label="Orijinal mənbə mətni" htmlFor="originalSourceText" hint="Yalnız admin panelində görünür — mənbənin orijinal ifadəsi">
        <Textarea id="originalSourceText" name="originalSourceText" maxLength={8000} defaultValue={record?.originalSourceText ?? ""} />
      </FormField>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/xatire">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
