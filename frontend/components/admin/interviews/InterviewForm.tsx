"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { interviewsApi } from "@/lib/api/interviews";
import { sourceStatusLabels, videoEmbedProviderLabels } from "@/lib/api/labels";
import type { InterviewDto, MediaAssetDto, SourceStatus, VideoEmbedProvider } from "@/lib/api/types";

const PROVIDER_OPTIONS = Object.entries(videoEmbedProviderLabels) as [VideoEmbedProvider, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

type Props = {
  interview?: InterviewDto;
  personOptions: { id: string; name: string }[];
};

export function InterviewForm({ interview, personOptions }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [thumbnailMediaAssetId, setThumbnailMediaAssetId] = useState<string | null>(interview?.thumbnailMediaAssetId ?? null);
  const isEdit = !!interview;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      personName: String(form.get("personName") ?? ""),
      relatedPersonId: String(form.get("relatedPersonId") ?? "") || null,
      title: String(form.get("title") ?? "") || null,
      description: String(form.get("description") ?? "") || null,
      transcript: String(form.get("transcript") ?? "") || null,
      embedProvider: form.get("embedProvider") as VideoEmbedProvider,
      embedUrlOrKey: String(form.get("embedUrlOrKey") ?? ""),
      thumbnailMediaAssetId,
      recordingDate: String(form.get("recordingDate") ?? "") || null,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      editorialNote: String(form.get("editorialNote") ?? "") || null,
      originalSourceText: String(form.get("originalSourceText") ?? "") || null,
    };

    try {
      if (isEdit) {
        await interviewsApi.update(interview.id, payload);
        setStatus("success");
        router.push(`/admin/kendimizin-sesi/${interview.id}/redakte?s=${interview.publicationStatus}`);
      } else {
        const created = await interviewsApi.create(payload);
        router.push(`/admin/kendimizin-sesi/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Müsahibin adı" htmlFor="personName" required>
          <Input id="personName" name="personName" required maxLength={150} defaultValue={interview?.personName} />
        </FormField>
        <FormField
          label="İnsanlarımız profili ilə əlaqələndir"
          htmlFor="relatedPersonId"
          hint="Boş buraxıla bilər"
        >
          <Select id="relatedPersonId" name="relatedPersonId" defaultValue={interview?.relatedPersonId ?? ""}>
            <option value="">—</option>
            {personOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Başlıq/mövzu" htmlFor="title" hint="Boş buraxıla bilər">
        <Input id="title" name="title" maxLength={200} defaultValue={interview?.title ?? ""} />
      </FormField>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" maxLength={2000} defaultValue={interview?.description ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Provayder" htmlFor="embedProvider" required hint="Səs yazısı üçün 'Öz serverimiz' seçin">
          <Select id="embedProvider" name="embedProvider" defaultValue={interview?.embedProvider ?? "YouTube"} required>
            {PROVIDER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Video/audio URL / açar" htmlFor="embedUrlOrKey" required>
          <Input id="embedUrlOrKey" name="embedUrlOrKey" required maxLength={500} defaultValue={interview?.embedUrlOrKey} />
        </FormField>
      </div>

      <FormField label="Söhbətin mətni (transkript)" htmlFor="transcript" hint="Boş buraxıla bilər">
        <Textarea id="transcript" name="transcript" maxLength={20000} defaultValue={interview?.transcript ?? ""} />
      </FormField>

      <ImageUploadField
        label="Ön izləmə şəkli"
        initialPreviewUrl={interview?.thumbnailImageUrl}
        onUploaded={(media: MediaAssetDto) => setThumbnailMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <FormField label="Qeydə alınma tarixi" htmlFor="recordingDate" hint="Boş buraxıla bilər">
        <Input id="recordingDate" name="recordingDate" type="date" defaultValue={interview?.recordingDate ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={interview?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mənbə/istinad" htmlFor="sourceReference" hint="Boş buraxıla bilər">
          <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={interview?.sourceReference ?? ""} />
        </FormField>
      </div>

      <FormField label="Redaktor qeydi" htmlFor="editorialNote" hint="Yalnız admin panelində görünür">
        <Textarea id="editorialNote" name="editorialNote" maxLength={2000} defaultValue={interview?.editorialNote ?? ""} />
      </FormField>

      <FormField label="Orijinal mənbə mətni" htmlFor="originalSourceText" hint="Yalnız admin panelində görünür">
        <Textarea id="originalSourceText" name="originalSourceText" maxLength={8000} defaultValue={interview?.originalSourceText ?? ""} />
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
        <Button type="button" variant="outline" href="/admin/kendimizin-sesi">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
