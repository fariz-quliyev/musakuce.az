"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { localInfoApi } from "@/lib/api/localInfo";
import { localInfoKindLabels } from "@/lib/api/labels";
import type { LocalInfoEntryDto, LocalInfoKind } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(localInfoKindLabels) as [LocalInfoKind, string][];

export function LocalInfoForm({ entry }: { entry?: LocalInfoEntryDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const isEdit = !!entry;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      kind: form.get("kind") as LocalInfoKind,
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "") || null,
      contactInfo: String(form.get("contactInfo") ?? "") || null,
      areaServed: String(form.get("areaServed") ?? "") || null,
      photoUrl: String(form.get("photoUrl") ?? "") || null,
      attachedToEntryId: String(form.get("attachedToEntryId") ?? "") || null,
    };

    try {
      if (isEdit) {
        await localInfoApi.update(entry.id, payload);
        router.push(`/admin/faydali-melumatlar/${entry.id}/redakte?s=${entry.publicationStatus}`);
      } else {
        const created = await localInfoApi.create(payload);
        router.push(`/admin/faydali-melumatlar/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Ad" htmlFor="name" required>
          <Input id="name" name="name" required maxLength={150} defaultValue={entry?.name} />
        </FormField>
        <FormField label="Növ" htmlFor="kind" required>
          <Select id="kind" name="kind" defaultValue={entry?.kind ?? "Service"} required>
            {KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Kateqoriya" htmlFor="category" required hint="Sərbəst mətn — məs. 'Santexnik', 'Aptek'">
        <Input id="category" name="category" required maxLength={100} defaultValue={entry?.category} />
      </FormField>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" maxLength={2000} defaultValue={entry?.description ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Əlaqə" htmlFor="contactInfo" hint="Boş buraxıla bilər">
          <Input id="contactInfo" name="contactInfo" maxLength={200} defaultValue={entry?.contactInfo ?? ""} />
        </FormField>
        <FormField label="Əhatə etdiyi ərazi" htmlFor="areaServed" hint="Boş buraxıla bilər">
          <Input id="areaServed" name="areaServed" maxLength={200} defaultValue={entry?.areaServed ?? ""} />
        </FormField>
      </div>

      <FormField label="Şəkil URL-i" htmlFor="photoUrl" hint="Boş buraxıla bilər">
        <Input id="photoUrl" name="photoUrl" type="url" defaultValue={entry?.photoUrl ?? ""} />
      </FormField>

      <FormField
        label="Bağlı olduğu qeyd (ID)"
        htmlFor="attachedToEntryId"
        hint="Yalnız 'Tövsiyə' mövcud bir qeydə əlavə edildikdə — həmin qeydin ID-si"
      >
        <Input id="attachedToEntryId" name="attachedToEntryId" defaultValue={entry?.attachedToEntryId ?? ""} />
      </FormField>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/faydali-melumatlar">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
