"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { eventsApi } from "@/lib/api/events";
import { eventCategoryLabels } from "@/lib/api/labels";
import type { EventCategory, EventDto, MediaAssetDto } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(eventCategoryLabels) as [EventCategory, string][];

/** ISO datetime -> value for <input type="datetime-local">. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: { event?: EventDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(event?.coverMediaAssetId ?? null);
  const isEdit = !!event;

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setStatus("submitting");
    const form = new FormData(formEvent.currentTarget);
    const startsAtLocal = String(form.get("startsAt") ?? "");
    const endsAtLocal = String(form.get("endsAt") ?? "");

    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      category: form.get("category") as EventCategory,
      startsAt: new Date(startsAtLocal).toISOString(),
      endsAt: endsAtLocal ? new Date(endsAtLocal).toISOString() : null,
      location: String(form.get("location") ?? ""),
      organizerName: String(form.get("organizerName") ?? "") || null,
      coverMediaAssetId,
    };

    try {
      if (isEdit) {
        await eventsApi.update(event.id, payload);
        setStatus("idle");
        router.push(`/admin/teqvim/${event.id}/redakte?s=${event.publicationStatus}`);
      } else {
        const created = await eventsApi.create(payload);
        router.push(`/admin/teqvim/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      <FormField label="Başlıq" htmlFor="title" required>
        <Input id="title" name="title" required maxLength={150} defaultValue={event?.title} />
      </FormField>

      <FormField label="Təsvir" htmlFor="description" required>
        <Textarea id="description" name="description" required maxLength={4000} defaultValue={event?.description} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue={event?.category ?? "Community"} required>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Yer" htmlFor="location" required>
          <Input id="location" name="location" required maxLength={200} defaultValue={event?.location} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Başlama tarixi/vaxtı" htmlFor="startsAt" required>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(event?.startsAt ?? null)}
          />
        </FormField>
        <FormField label="Bitmə tarixi/vaxtı" htmlFor="endsAt" hint="Boş buraxıla bilər">
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInputValue(event?.endsAt ?? null)}
          />
        </FormField>
      </div>

      <FormField label="Təşkilatçı" htmlFor="organizerName" hint="Boş buraxıla bilər">
        <Input id="organizerName" name="organizerName" maxLength={150} defaultValue={event?.organizerName ?? ""} />
      </FormField>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={event?.coverImageUrl}
        onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
        hint="Boş buraxıla bilər — JPEG, PNG, WebP və ya AVIF, maks. 15 MB"
      />

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/teqvim">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
