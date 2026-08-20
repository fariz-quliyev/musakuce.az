"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { correctionsApi } from "@/lib/api/corrections";
import { cn } from "@/lib/cn";
import type { MediaAssetDto, TargetEntityType } from "@/lib/api/types";

/**
 * The single "Məlumatda səhv və ya əlavə var?" entry point, embedded on
 * every public content-detail view across all 10 content types (People,
 * History, Education, Memorial, CulturalHeritage, Interviews, Places,
 * LocalInfo, Photos, Videos). Reuses ImageUploadField's community-upload
 * mode (same anonymous, rate-limited path CommunitySubmissionForm
 * already uses) rather than inventing a second photo-intake mechanism.
 * The reader's submission is always Pending on the backend — nothing
 * here can change the target record directly.
 */
export function SuggestionCta({
  targetEntityType,
  targetEntityId,
  tone = "default",
}: {
  targetEntityType: TargetEntityType;
  targetEntityId: string;
  /** "memorial" matches the /xatire page's dark-surface palette (Badge
   * tone="memorial" is the same precedent). "dark" is for surfaces with
   * no card of their own at all — PhotoLightbox's full-bleed dark
   * overlay — where the toggle/link needs light-on-dark text and the
   * opened form is wrapped in its own light card so the rest of the
   * form's normal light-theme text stays legible without re-theming
   * every field. Every other content type uses the site's default
   * forest/ink palette on its own light page background. */
  tone?: "default" | "memorial" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [photo, setPhoto] = useState<MediaAssetDto | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  if (!open) {
    return (
      <div
        className={cn(
          "border-t pt-4",
          tone === "memorial" ? "border-memorial-line" : tone === "dark" ? "border-cream/20" : "border-stone-light",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "text-sm font-medium hover:underline",
            tone === "memorial" ? "text-memorial-accent" : tone === "dark" ? "text-cream" : "text-forest",
          )}
        >
          Məlumatda səhv və ya əlavə var? → Düzəliş təklif et
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-stone-light bg-paper-soft p-4 text-sm">
        <p className="font-medium text-forest">Təşəkkür edirik!</p>
        <p className="mt-1 text-ink-soft">Təklifiniz qeydə alındı və moderator tərəfindən nəzərdən keçiriləcək.</p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    try {
      await correctionsApi.create({
        targetEntityType,
        targetEntityId,
        fieldOrSection: String(form.get("fieldOrSection") ?? "") || null,
        suggestedChange: String(form.get("suggestedChange") ?? "") || null,
        additionalNotes: String(form.get("additionalNotes") ?? "") || null,
        photoMediaAssetId: photo?.id ?? null,
        submitterName: String(form.get("submitterName") ?? "") || null,
        contactInfo: String(form.get("contactInfo") ?? "") || null,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("grid gap-4", tone === "dark" ? "rounded-lg bg-paper p-4 shadow-md" : "border-t border-stone-light pt-4")}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Düzəliş təklif et</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-faint hover:underline">
          Bağla
        </button>
      </div>

      <FormField label="Hansı hissəyə aiddir" htmlFor="fieldOrSection" hint="Boş buraxıla bilər — məs. 'doğum tarixi', 'başlıq'">
        <Input id="fieldOrSection" name="fieldOrSection" maxLength={200} />
      </FormField>

      <FormField label="Təklif olunan düzəliş və ya əlavə məlumat" htmlFor="suggestedChange">
        <Textarea id="suggestedChange" name="suggestedChange" maxLength={4000} />
      </FormField>

      <FormField label="Əlavə izah" htmlFor="additionalNotes" hint="Boş buraxıla bilər">
        <Textarea id="additionalNotes" name="additionalNotes" maxLength={4000} />
      </FormField>

      <ImageUploadField
        label="Şəkil"
        community
        hint="Boş buraxıla bilər — mövzu ilə bağlı foto əlavə edə bilərsiniz"
        onUploaded={setPhoto}
        onUploadingChange={setPhotoUploading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Ad, soyad" htmlFor="submitterName" hint="Boş buraxıla bilər">
          <Input id="submitterName" name="submitterName" maxLength={100} />
        </FormField>
        <FormField label="Əlaqə (telefon və ya e-poçt)" htmlFor="contactInfo" hint="Boş buraxıla bilər">
          <Input id="contactInfo" name="contactInfo" maxLength={200} />
        </FormField>
      </div>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Göndərmək mümkün olmadı. Bir az sonra yenidən cəhd edin.</p>
      ) : null}

      <Button type="submit" size="sm" loading={status === "submitting"} disabled={photoUploading} className="w-fit">
        Göndər
      </Button>
    </form>
  );
}
