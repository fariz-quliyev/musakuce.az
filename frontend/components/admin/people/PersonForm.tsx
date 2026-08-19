"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { RichTextEditor } from "@/components/admin/shared/RichTextEditor";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { personCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PersonCategory, PersonDto, PublicationStatus, SourceStatus } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(personCategoryLabels) as [PersonCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

/** Groups the form into the labeled sections a long profile-editing
 * form needs (spec: Şəxsi məlumatlar / Bioqrafiya / Foto / Mənbə və
 * status / Əməliyyatlar) — same `rounded-lg border border-stone-light
 * bg-paper` card language already used elsewhere in the admin (e.g.
 * the /admin/insanlar list table), just applied per-section here
 * instead of once around a whole table. */
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // min-w-0 on both: each section is now a grid item of the top-level
    // form grid, and its own inner grid item in turn — the Bioqrafiya
    // section's toolbar has a wide natural (unwrapped) content width, and
    // a grid item's default min-width is that natural width unless
    // overridden, at every level of nesting. See RichTextEditor.tsx's
    // own min-w-0 note for the original (single-layer) version of this.
    <section className="min-w-0 rounded-lg border border-stone-light bg-paper p-5 sm:p-6">
      <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">{title}</h2>
      <div className="grid min-w-0 gap-5">{children}</div>
    </section>
  );
}

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
  // The upload itself is async (a separate request from the form's own
  // submit) — coverMediaAssetId only updates once it resolves, so a save
  // that fires while it's still in flight silently persists the person
  // WITHOUT the just-selected photo (confirmed in production: the form
  // showed "Yükləndi." and a preview, but the saved record's
  // coverMediaAssetId was null). Blocking submit while this is true
  // closes that window.
  const [photoUploading, setPhotoUploading] = useState(false);
  const [biographyEmpty, setBiographyEmpty] = useState(!person?.biography?.trim());
  // A brand-new person is always created as Draft (Person.PublicationStatus's
  // domain default) — an existing Archived person defaults to "Draft" here
  // too, since Archived isn't one of this picker's two choices; picking
  // either option still moves it to a real, intentional state.
  const [publicationChoice, setPublicationChoice] = useState<Extract<PublicationStatus, "Draft" | "Published">>(
    person?.publicationStatus === "Published" ? "Published" : "Draft",
  );
  const isEdit = !!person;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const biographyHtml = String(form.get("biography") ?? "");

    // Defense in depth alongside the disabled Save button below — a
    // keyboard Enter-to-submit doesn't go through the button's own
    // `disabled` state, so this is the one guard that can't be bypassed.
    if (photoUploading) {
      setStatus("error");
      setErrorMessage("Şəkil hələ yüklənir. Yükləmə bitənə qədər gözləyin.");
      return;
    }

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
      // Content (this PUT/POST) and publication status (the existing
      // PATCH .../status endpoint, already used by the list's
      // publish/archive actions and gated by the same Permissions.
      // PeopleModerate every role that can reach this form already has)
      // stay two separate backend calls — reusing exactly what's there
      // instead of teaching Create/UpdatePersonRequest a new field.
      let personId: string;
      let currentStatus: PublicationStatus;
      if (isEdit) {
        await peopleApi.update(person.id, payload);
        personId = person.id;
        currentStatus = person.publicationStatus;
      } else {
        const created = await peopleApi.create(payload);
        personId = created.id;
        currentStatus = created.publicationStatus;
      }

      // Content is safely saved from here on regardless of what happens
      // next — only call the status endpoint when the choice actually
      // differs, so an unchanged Draft/Published doesn't get a spurious
      // audit-log entry or a wasted request.
      let finalStatus = currentStatus;
      let statusErrorMessage: string | null = null;
      if (publicationChoice !== currentStatus) {
        try {
          const updated = await peopleApi.updateStatus(personId, { publicationStatus: publicationChoice });
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
      // Navigate even when only the status call failed — the content was
      // genuinely saved (for a new person, already created in the
      // database), so staying on an empty "yeni şəxs" form would risk a
      // duplicate on retry. The redirect's own ?s= reflects what's
      // actually true (finalStatus), not what was requested.
      router.push(`/admin/insanlar/${personId}/redakte?s=${finalStatus}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(describeSaveError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5 pb-2">
      <FormSection title="Şəxsi məlumatlar">
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
      </FormSection>

      <FormSection title="Bioqrafiya">
        <FormField
          label="Bioqrafiya"
          htmlFor="biography"
          required
          hint="Maks. 8000 simvol (formatlaşdırma teqləri də daxil olmaqla)"
          className="min-w-0"
        >
          {/* min-w-0: FormField is a grid item — a grid/flex item's
              default min-width is its content's natural (unwrapped)
              size, which for the toolbar's fixed-width buttons is wider
              than a 390px viewport. Without this, the toolbar's own
              overflow-x-auto never gets a chance to activate and the
              whole page grows to fit it instead (confirmed empirically:
              removing the toolbar removed the page-level horizontal
              overflow). Every other FormField in this form is narrow
              enough that its content never hits this, which is why this
              is the only one that needs it. */}
          <RichTextEditor
            id="biography"
            name="biography"
            initialContent={person?.biography ?? ""}
            onEmptyChange={setBiographyEmpty}
          />
        </FormField>
      </FormSection>

      <FormSection title="Foto">
        <ImageUploadField
          label="Şəkil"
          initialPreviewUrl={person?.coverImageUrl}
          onUploaded={(media: MediaAssetDto) => setCoverMediaAssetId(media.id)}
          onRemove={() => setCoverMediaAssetId(null)}
          onUploadingChange={setPhotoUploading}
          // Matches the actual crop used everywhere this photo is shown
          // publicly (person detail page's aspect-[3/4], the /insanlarimiz
          // grid's CardMedia aspect="portrait") — without this the preview
          // defaulted to a 16:9 box, so admins were approving a crop that
          // had nothing to do with what visitors would actually see,
          // which is exactly why photos of different source dimensions
          // ended up looking inconsistent on the public site.
          previewAspectClassName="aspect-[3/4]"
          // Admin picks the exact crop themselves (drag + zoom) instead
          // of leaving it to automatic centering — same 3/4 ratio the
          // preview box above and the public site both already use.
          cropAspectRatio={3 / 4}
          hint="JPEG, PNG, WebP və ya AVIF, maks. 15 MB — boş buraxıla bilər. Seçdikdən sonra kadrı özünüz ayarlaya bilərsiniz (portret, 3:4)."
        />
      </FormSection>

      <FormSection title="Mənbə və status">
        <FormField label="Mənbə statusu" htmlFor="sourceStatus" required>
          <Select id="sourceStatus" name="sourceStatus" defaultValue={person?.sourceStatus ?? "UnderResearch"} required>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </FormSection>

      {/* Əməliyyatlar — sticky so "Yadda saxla" stays reachable without
          hunting for it at the bottom of a long biography, without
          needing a JS scroll-to or floating-button hack. */}
      <div className="sticky bottom-0 z-10 -mx-5 rounded-t-lg border-t border-stone-light bg-paper/95 px-5 py-4 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:border">
        {status === "success" ? (
          <p className="mb-3 text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
        ) : null}
        {status === "error" ? (
          <p className="mb-3 text-sm font-medium text-danger">{errorMessage}</p>
        ) : null}
        {photoUploading ? (
          <p className="mb-3 text-sm font-medium text-ink-soft">Şəkil yüklənir, bir az gözləyin…</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={status === "submitting"} disabled={photoUploading}>
            Yadda saxla
          </Button>

          <div className="flex items-center gap-2">
            <Select
              aria-label="Nəşr statusu"
              value={publicationChoice}
              onChange={(event) => setPublicationChoice(event.target.value as "Draft" | "Published")}
              className="w-auto py-2"
            >
              <option value="Draft">Qaralama</option>
              <option value="Published">Yayımla</option>
            </Select>
            {/* Every save applies whichever of these two is currently
                selected — "Yadda saxla" never silently decides the status
                on its own (spec requirement). */}
            {publicationChoice === "Published" ? (
              <Badge tone="success" dot>
                Saytda dərhal görünəcək
              </Badge>
            ) : (
              <Badge tone="neutral" dot>
                Saytda görünməyəcək
              </Badge>
            )}
          </div>

          <Button type="button" variant="outline" href="/admin/insanlar">
            Ləğv et
          </Button>
        </div>
      </div>
    </form>
  );
}
