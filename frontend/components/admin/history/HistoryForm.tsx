"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { historyApi } from "@/lib/api/history";
import { sourceStatusLabels, eventIconLabels } from "@/lib/api/labels";
import type { EventIcon, HistoricalEventDto, MediaAssetDto, SourceStatus } from "@/lib/api/types";

const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];
const EVENT_ICON_OPTIONS = Object.entries(eventIconLabels) as [EventIcon, string][];

type ImageSlot = { key: string; mediaAssetId: string | null; previewUrl: string | null };

export function HistoryForm({ event }: { event?: HistoricalEventDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(event?.coverMediaAssetId ?? null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(event?.coverImageUrl ?? null);
  const [iconMediaAssetId, setIconMediaAssetId] = useState<string | null>(event?.iconMediaAssetId ?? null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(event?.iconImageUrl ?? null);
  const [additionalImages, setAdditionalImages] = useState<ImageSlot[]>(
    () => event?.additionalImages.map((img) => ({ key: img.id, mediaAssetId: img.mediaAssetId, previewUrl: img.imageUrl })) ?? [],
  );
  const isEdit = !!event;

  function addImageSlot() {
    setAdditionalImages((slots) => [...slots, { key: crypto.randomUUID(), mediaAssetId: null, previewUrl: null }]);
  }
  function removeImageSlot(key: string) {
    setAdditionalImages((slots) => slots.filter((s) => s.key !== key));
  }
  function setSlotMedia(key: string, media: MediaAssetDto) {
    setAdditionalImages((slots) => slots.map((s) => (s.key === key ? { ...s, mediaAssetId: media.id, previewUrl: media.url } : s)));
  }

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setStatus("submitting");
    const form = new FormData(formEvent.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      period: String(form.get("period") ?? ""),
      eventDate: String(form.get("eventDate") ?? "") || null,
      description: String(form.get("description") ?? ""),
      detailedText: String(form.get("detailedText") ?? "") || null,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      displayOrder: Number(form.get("displayOrder") ?? 0),
      eventIcon: form.get("eventIcon") as EventIcon,
      coverMediaAssetId,
      iconMediaAssetId,
      showInTimeline: form.get("showInTimeline") === "on",
      additionalImageMediaAssetIds: additionalImages.flatMap((s) => (s.mediaAssetId ? [s.mediaAssetId] : [])),
    };

    try {
      if (isEdit) {
        await historyApi.update(event.id, payload);
        setStatus("success");
        router.push(`/admin/tarix/${event.id}/redakte?s=${event.publicationStatus}`);
      } else {
        const created = await historyApi.create(payload);
        router.push(`/admin/tarix/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      {event?.isDefault ? (
        <p className="rounded-md bg-info-bg px-3 py-2 text-sm text-info">
          Bu, timeline-ın nümunə (default) məzmunudur — real məlumatla əvəz edin və ya bu formada redaktə edin.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Başlıq" htmlFor="title" required>
          <Input id="title" name="title" required maxLength={150} defaultValue={event?.title} />
        </FormField>
        <FormField label="Dövr" htmlFor="period" required hint="Sərbəst mətn — məs. '1930-cu illər'">
          <Input id="period" name="period" required maxLength={50} defaultValue={event?.period} />
        </FormField>
      </div>

      <FormField label="Dəqiq tarix" htmlFor="eventDate" hint="Boş buraxıla bilər">
        <Input id="eventDate" name="eventDate" type="date" defaultValue={event?.eventDate ?? ""} />
      </FormField>

      <FormField label="Qısa təsvir" htmlFor="description" required hint="Timeline kartında və ətraflı panelin giriş sətrində göstərilir">
        <Textarea id="description" name="description" required maxLength={4000} defaultValue={event?.description} />
      </FormField>

      <FormField label="Ətraflı mətn" htmlFor="detailedText" hint="Boş buraxıla bilər — yalnız ətraflı paneldə, qısa təsvirdən sonra göstərilir">
        <Textarea id="detailedText" name="detailedText" maxLength={8000} defaultValue={event?.detailedText ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={event?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Sıra nömrəsi" htmlFor="displayOrder" hint="Xronoloji sıralama üçün">
          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={event?.displayOrder ?? 0} />
        </FormField>
      </div>

      <FormField label="Timeline ikonu" htmlFor="eventIcon" required hint="Hadisənin xarakterinə uyğun marker seçin — aşağıda öz şəklinizi yükləsəniz, o bunun yerinə istifadə olunur">
        <Select id="eventIcon" name="eventIcon" defaultValue={event?.eventIcon ?? "General"} required>
          {EVENT_ICON_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-2">
        <ImageUploadField
          key={iconMediaAssetId ?? "empty"}
          label="Xüsusi marker şəkli"
          initialPreviewUrl={iconPreviewUrl}
          onUploaded={(media) => {
            setIconMediaAssetId(media.id);
            setIconPreviewUrl(media.url);
          }}
          hint="Boş buraxıla bilər — yüklənərsə, yuxarıdakı kateqoriya ikonu əvəzinə bu şəkil kiçik dairəvi marker kimi göstərilir"
        />
        {iconMediaAssetId ? (
          <button
            type="button"
            onClick={() => {
              setIconMediaAssetId(null);
              setIconPreviewUrl(null);
            }}
            className="w-fit text-xs font-medium text-danger hover:underline"
          >
            Şəkli sil
          </button>
        ) : null}
      </div>

      <FormField
        label="Mənbə istinadı"
        htmlFor="sourceReference"
        hint="Boş buraxıla bilər — məs. 'Ailə arxivi, Səlim baba ilə söhbət, 2020'"
      >
        <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={event?.sourceReference ?? ""} />
      </FormField>

      <div className="grid gap-2">
        <ImageUploadField
          key={coverMediaAssetId ?? "empty"}
          label="Əsas şəkil"
          initialPreviewUrl={coverPreviewUrl}
          onUploaded={(media) => {
            setCoverMediaAssetId(media.id);
            setCoverPreviewUrl(media.url);
          }}
          hint="Boş buraxıla bilər — timeline kartında və ətraflı paneldə göstərilir"
        />
        {coverMediaAssetId ? (
          <button
            type="button"
            onClick={() => {
              setCoverMediaAssetId(null);
              setCoverPreviewUrl(null);
            }}
            className="w-fit text-xs font-medium text-danger hover:underline"
          >
            Şəkli sil
          </button>
        ) : null}
      </div>

      <div className="grid gap-4">
        <p className="text-sm font-semibold text-ink">Əlavə şəkillər</p>
        {additionalImages.map((slot, i) => (
          <div key={slot.key} className="grid gap-2 rounded-lg border border-stone-light bg-paper-soft p-3">
            <ImageUploadField label={`Əlavə şəkil ${i + 1}`} initialPreviewUrl={slot.previewUrl} onUploaded={(media) => setSlotMedia(slot.key, media)} />
            <button type="button" onClick={() => removeImageSlot(slot.key)} className="w-fit text-xs font-medium text-danger hover:underline">
              Sil
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addImageSlot} className="w-fit">
          + Şəkil əlavə et
        </Button>
      </div>

      <Checkbox
        id="showInTimeline"
        name="showInTimeline"
        label="Zaman xəttində göstər"
        description="Söndürsəniz, bu hadisə Tariximiz siyahısında qalır, amma /kendimiz-dəki timeline-da görünmür"
        defaultChecked={event?.showInTimeline ?? true}
      />

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
        <Button type="button" variant="outline" href="/admin/tarix">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
