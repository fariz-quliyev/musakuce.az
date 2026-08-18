"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { BiographyEditor } from "@/components/admin/people/BiographyEditor";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { personCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PersonCategory, PersonDto, SourceStatus } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(personCategoryLabels) as [PersonCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

/** Surfaces the backend's actual reason instead of a fixed string — a
 * FluentValidation 400 carries per-field messages in `detail.errors`, the
 * global exception handler's ProblemDetails carries one in `detail.detail`
 * (403/404/409 are all client-safe per GlobalExceptionHandler.cs), and a
 * generic 500 has neither, so it falls back to a still-informative
 * default rather than a silent, unexplained failure. */
function describeSaveError(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = err.detail as { detail?: string; errors?: Record<string, string[]> } | undefined;
    if (detail?.errors) {
      const messages = Object.values(detail.errors).flat();
      if (messages.length > 0) return messages.join(" ");
    }
    if (detail?.detail) return detail.detail;
    if (err.status === 403) return "Bu əməliyyat üçün icazəniz yoxdur.";
  }
  return "Yadda saxlamaq mümkün olmadı. Bir az sonra yenidən cəhd edin.";
}

export function PersonForm({ person }: { person?: PersonDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(person?.coverMediaAssetId ?? null);
  const [biographyEmpty, setBiographyEmpty] = useState(!person?.biography?.trim());
  const isEdit = !!person;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const biographyHtml = String(form.get("biography") ?? "");

    // The editor is a contenteditable, not a native input, so the
    // `required`/`maxLength` HTML5 constraints that used to apply to the
    // `<textarea>` can't reach it — this replaces both, through the same
    // error paragraph every other save failure already uses. The 8000
    // limit is unchanged (PersonValidators.cs/PersonConfiguration.cs) —
    // it now counts the saved HTML's length, same as what the backend
    // actually validates against.
    if (biographyEmpty) {
      setStatus("error");
      setErrorMessage("Bioqrafiya tələb olunur.");
      return;
    }
    if (biographyHtml.length > 8000) {
      setStatus("error");
      setErrorMessage(`Bioqrafiya çox uzundur (${biographyHtml.length}/8000 simvol, formatlaşdırma daxil). Mətni qısaldın.`);
      return;
    }

    setStatus("submitting");

    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      fatherName: String(form.get("fatherName") ?? "") || null,
      birthDate: String(form.get("birthDate") ?? "") || null,
      deathDate: String(form.get("deathDate") ?? "") || null,
      category: form.get("category") as PersonCategory,
      occupation: String(form.get("occupation") ?? "") || null,
      biography: biographyHtml,
      coverMediaAssetId,
      sourceStatus: form.get("sourceStatus") as SourceStatus,
    };

    try {
      if (isEdit) {
        await peopleApi.update(person.id, payload);
        setStatus("success");
        router.push(`/admin/insanlar/${person.id}/redakte?s=${person.publicationStatus}`);
      } else {
        const created = await peopleApi.create(payload);
        router.push(`/admin/insanlar/${created.id}/redakte?s=${created.publicationStatus}`);
      }
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
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

      <FormField
        label="Bioqrafiya"
        htmlFor="biography"
        required
        hint="Maks. 8000 simvol (formatlaşdırma teqləri də daxil olmaqla)"
        className="min-w-0"
      >
        {/* min-w-0: FormField is a direct item of PersonForm's top-level
            `grid` — a grid/flex item's default min-width is its
            content's natural (unwrapped) size, which for the toolbar's
            fixed-width buttons is wider than a 390px viewport. Without
            this, the toolbar's own overflow-x-auto never gets a chance
            to activate and the whole page grows to fit it instead
            (confirmed empirically: removing the toolbar removed the
            page-level horizontal overflow). Every other FormField in
            this form is narrow enough that its content never hits this,
            which is why this is the only one that needs it. */}
        <BiographyEditor
          id="biography"
          name="biography"
          initialContent={person?.biography ?? ""}
          onEmptyChange={setBiographyEmpty}
        />
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

      {status === "success" ? (
        <p className="text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm font-medium text-danger">{errorMessage}</p>
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
