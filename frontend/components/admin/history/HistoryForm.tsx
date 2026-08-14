"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { historyApi } from "@/lib/api/history";
import { sourceStatusLabels } from "@/lib/api/labels";
import type { HistoricalEventDto, SourceStatus } from "@/lib/api/types";

const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function HistoryForm({ event }: { event?: HistoricalEventDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const isEdit = !!event;

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setStatus("submitting");
    const form = new FormData(formEvent.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      period: String(form.get("period") ?? ""),
      eventDate: String(form.get("eventDate") ?? "") || null,
      description: String(form.get("description") ?? ""),
      sourceStatus: form.get("sourceStatus") as SourceStatus,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
      displayOrder: Number(form.get("displayOrder") ?? 0),
    };

    try {
      if (isEdit) {
        await historyApi.update(event.id, payload);
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

      <FormField label="Təsvir" htmlFor="description" required>
        <Textarea id="description" name="description" required maxLength={4000} defaultValue={event?.description} />
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

      <FormField
        label="Mənbə istinadı"
        htmlFor="sourceReference"
        hint="Boş buraxıla bilər — məs. 'Ailə arxivi, Səlim baba ilə söhbət, 2020'"
      >
        <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={event?.sourceReference ?? ""} />
      </FormField>

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
