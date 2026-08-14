"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { submissionsApi } from "@/lib/api/submissions";
import { mediaApi } from "@/lib/api/media";
import type { SubmissionKind } from "@/lib/api/types";

const SHOWS_FILE_UPLOAD: SubmissionKind[] = ["Photo", "Video"];

type UploadedFile = { key: string; name: string; url: string; status: "uploading" | "done" | "error" };

/**
 * The single public, anonymous intake behind all four ContributeCta
 * buttons ("Foto göndər", "Video göndər", "Xatirə paylaş", "Tarixi
 * məlumat göndər") — reuses CommunitySubmission rather than four
 * separate forms/entities (spec §22). Always created Pending on the
 * backend; an editor/archivist reviews it from /admin/gonderisler.
 *
 * Phase 8: file attachment is a real upload (via the anonymous,
 * rate-limited /api/media/community-upload endpoint) rather than a
 * free-text URL field — still image-only; "Video göndər" describes the
 * video in the text fields below rather than uploading a video file,
 * per Phase 8's scope decision to keep video URL-only.
 */
export function CommunitySubmissionForm({ kind }: { kind: SubmissionKind }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    for (const file of selected) {
      const key = `${file.name}-${file.size}-${Date.now()}`;
      setFiles((prev) => [...prev, { key, name: file.name, url: "", status: "uploading" }]);
      try {
        const media = await mediaApi.uploadCommunity(file);
        setFiles((prev) => prev.map((f) => (f.key === key ? { ...f, url: media.url, status: "done" } : f)));
      } catch {
        setFiles((prev) => prev.map((f) => (f.key === key ? { ...f, status: "error" } : f)));
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);
    const fileUrls = files.filter((f) => f.status === "done").map((f) => f.url);

    try {
      await submissionsApi.create({
        submitterName: String(form.get("submitterName") ?? ""),
        contactInfo: String(form.get("contactInfo") ?? ""),
        kind,
        description: String(form.get("description") ?? ""),
        suggestedDate: String(form.get("suggestedDate") ?? "") || null,
        suggestedLocation: String(form.get("suggestedLocation") ?? "") || null,
        peopleShown: String(form.get("peopleShown") ?? "") || null,
        sourceNote: String(form.get("sourceNote") ?? "") || null,
        permissionToPublish: form.get("permissionToPublish") === "on",
        fileUrls,
      });
      setStatus("done");
      event.currentTarget.reset();
      setFiles([]);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-stone-light bg-paper-soft p-6 text-center">
        <p className="font-display text-lg text-forest">Təşəkkür edirik!</p>
        <p className="mt-1 text-sm text-ink-soft">
          Göndərişiniz qeydə alındı və moderatordan nəzərdən keçirildikdən sonra arxivə əlavə olunacaq.
        </p>
      </div>
    );
  }

  const stillUploading = files.some((f) => f.status === "uploading");

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Ad, soyad" htmlFor="submitterName" required>
          <Input id="submitterName" name="submitterName" required maxLength={100} />
        </FormField>
        <FormField label="Əlaqə (telefon və ya e-poçt)" htmlFor="contactInfo" required>
          <Input id="contactInfo" name="contactInfo" required maxLength={200} />
        </FormField>
      </div>

      <FormField label="Təsvir" htmlFor="description" required hint="Nə paylaşırsınız, nə vaxt, harada?">
        <Textarea id="description" name="description" required maxLength={4000} />
      </FormField>

      {SHOWS_FILE_UPLOAD.includes(kind) ? (
        <FormField
          label="Fotolar"
          htmlFor="files"
          hint={
            kind === "Video"
              ? "Video linkini yuxarıdakı təsvirdə qeyd edin — burada yalnız foto (məs. üz qabığı şəkli) əlavə edə bilərsiniz"
              : "JPEG, PNG, WebP və ya AVIF — hər biri maks. 8 MB"
          }
        >
          <input
            id="files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFilesSelected}
            className="text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink-on-dark file:transition-colors hover:file:bg-forest-dark"
          />
          {files.length > 0 ? (
            <ul className="mt-2 grid gap-1 text-xs">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-2">
                  <span className="truncate text-ink-soft">{f.name}</span>
                  {f.status === "uploading" ? <span className="text-ink-faint">yüklənir…</span> : null}
                  {f.status === "done" ? <span className="font-medium text-success">yükləndi</span> : null}
                  {f.status === "error" ? <span className="font-medium text-danger">uğursuz oldu</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </FormField>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Təxmini tarix" htmlFor="suggestedDate" hint="Boş buraxıla bilər">
          <Input id="suggestedDate" name="suggestedDate" type="date" />
        </FormField>
        <FormField label="Yer" htmlFor="suggestedLocation" hint="Boş buraxıla bilər">
          <Input id="suggestedLocation" name="suggestedLocation" maxLength={200} />
        </FormField>
      </div>

      <FormField label="Şəkildə/videoda kimlər var" htmlFor="peopleShown" hint="Boş buraxıla bilər">
        <Input id="peopleShown" name="peopleShown" maxLength={300} />
      </FormField>

      <FormField label="Mənbə qeydi" htmlFor="sourceNote" hint="Boş buraxıla bilər — haradan/kimdən aldığınız">
        <Input id="sourceNote" name="sourceNote" maxLength={300} />
      </FormField>

      <Checkbox
        id="permissionToPublish"
        name="permissionToPublish"
        label="Bu materialın kənd arxivində dərc olunmasına icazə verirəm"
        required
      />

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">
          Göndərmək mümkün olmadı. Backend hazırda əlçatan deyilsə, bir az sonra yenidən cəhd edin.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        loading={status === "submitting"}
        disabled={stillUploading}
        className="w-fit"
      >
        Göndər
      </Button>
    </form>
  );
}
