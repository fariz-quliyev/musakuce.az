"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { timelineSettingsApi } from "@/lib/api/timelineSettings";
import type { TimelineSettingsDto } from "@/lib/api/types";

export function TimelineSettingsForm({ settings }: { settings?: TimelineSettingsDto | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);
    const maxEventsRaw = String(form.get("maxEventsDesktop") ?? "");

    const payload = {
      title: String(form.get("title") ?? ""),
      subtitle: String(form.get("subtitle") ?? ""),
      isActive: form.get("isActive") === "on",
      maxEventsDesktop: maxEventsRaw === "" ? null : Number(maxEventsRaw),
      defaultSelection: form.get("defaultSelection") as "First" | "Last",
      mobileBehavior: settings?.mobileBehavior ?? "HorizontalScroll",
    };

    try {
      await timelineSettingsApi.upsert(payload);
      setStatus("success");
      router.push("/admin/tarix/timeline");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-4xl gap-5">
      <FormField label="Bölmə başlığı" htmlFor="title" required>
        <Input id="title" name="title" required maxLength={150} defaultValue={settings?.title ?? "Zaman xəttində Musaküçə"} />
      </FormField>

      <FormField label="Alt mətn" htmlFor="subtitle" required>
        <Textarea
          id="subtitle"
          name="subtitle"
          required
          maxLength={500}
          defaultValue={
            settings?.subtitle ??
            "Nəsildən-nəslə ötürülən xatirələr, hadisələr və insanların zəhməti ilə bu günümüzə gəlib çatan Musaküçənin tarixi."
          }
        />
      </FormField>

      <Checkbox
        id="isActive"
        name="isActive"
        label="Timeline aktivdir"
        description="Söndürsəniz, bütün bölmə /kendimiz səhifəsindən tamamilə gizlənir"
        defaultChecked={settings?.isActive ?? true}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Desktop-da maksimum hadisə sayı" htmlFor="maxEventsDesktop" hint="Boş buraxılsa, bütün aktiv hadisələr göstərilir">
          <Input id="maxEventsDesktop" name="maxEventsDesktop" type="number" min={1} defaultValue={settings?.maxEventsDesktop ?? ""} />
        </FormField>
        <FormField label="Default seçilmiş hadisə" htmlFor="defaultSelection">
          <Select id="defaultSelection" name="defaultSelection" defaultValue={settings?.defaultSelection ?? "First"}>
            <option value="First">İlk hadisə</option>
            <option value="Last">Son hadisə</option>
          </Select>
        </FormField>
      </div>

      {status === "success" ? <p className="text-sm font-medium text-success">Uğurla saxlanıldı ✓</p> : null}
      {status === "error" ? <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p> : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
      </div>
    </form>
  );
}
