"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { peopleApi } from "@/lib/api/people";
import { personCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PersonCategory, PersonDto, SourceStatus } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(personCategoryLabels) as [PersonCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function PersonForm({ person }: { person?: PersonDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(person?.coverMediaAssetId ?? null);
  const isEdit = !!person;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      fatherName: String(form.get("fatherName") ?? "") || null,
      birthDate: String(form.get("birthDate") ?? "") || null,
      deathDate: String(form.get("deathDate") ?? "") || null,
      category: form.get("category") as PersonCategory,
      occupation: String(form.get("occupation") ?? "") || null,
      biography: String(form.get("biography") ?? ""),
      coverMediaAssetId,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
    };

    try {
      if (isEdit) {
        await peopleApi.update(person.id, payload);
        setStatus("idle");
        router.push(`/admin/insanlar/${person.id}/redakte?s=${person.publicationStatus}`);
      } else {
        const created = await peopleApi.create(payload);
        router.push(`/admin/insanlar/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Ad" htmlFor="firstName" required>
          <Input id="firstName" name="firstName" required maxLength={100} defaultValue={person?.firstName} />
        </FormField>
        <FormField label="Soyad" htmlFor="lastName" required>
          <Input id="lastName" name="lastName" required maxLength={100} defaultValue={person?.lastName} />
        </FormField>
        <FormField label="Ata adı" htmlFor="fatherName" hint="Boş buraxıla bilər">
          <Input id="fatherName" name="fatherName" maxLength={100} defaultValue={person?.fatherName ?? ""} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Doğum tarixi" htmlFor="birthDate" hint="Boş buraxıla bilər">
          <Input id="birthDate" name="birthDate" type="date" defaultValue={person?.birthDate ?? ""} />
        </FormField>
        <FormField label="Vəfat tarixi" htmlFor="deathDate" hint="Boş buraxıla bilər">
          <Input id="deathDate" name="deathDate" type="date" defaultValue={person?.deathDate ?? ""} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue={person?.category ?? "Other"} required>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Peşə" htmlFor="occupation" hint="Boş buraxıla bilər">
          <Input id="occupation" name="occupation" maxLength={150} defaultValue={person?.occupation ?? ""} />
        </FormField>
      </div>

      <FormField label="Bioqrafiya" htmlFor="biography" required>
        <Textarea id="biography" name="biography" required maxLength={8000} defaultValue={person?.biography} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageUploadField
          label="Şəkil"
          initialPreviewUrl={person?.coverImageUrl}
          onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
          hint="Boş buraxıla bilər — JPEG, PNG, WebP və ya AVIF, maks. 15 MB"
        />
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={person?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/insanlar">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
