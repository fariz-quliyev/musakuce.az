"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { listingsApi } from "@/lib/api/listings";
import type { ClassifiedCategory } from "@/lib/api/types";

const CATEGORY_OPTIONS: { value: ClassifiedCategory; label: string }[] = [
  { value: "AlqiSatqi", label: "Alqı-satqı" },
  { value: "MalQara", label: "Mal-qara" },
  { value: "KendTesserrufatiMehsullari", label: "Kənd təsərrüfatı məhsulları" },
  { value: "Texnika", label: "Texnika" },
  { value: "Avtomobil", label: "Avtomobil" },
  { value: "Xidmet", label: "Xidmət" },
  { value: "Is", label: "İş" },
  { value: "Axtarilir", label: "Axtarılır" },
  { value: "ItirilmisTapilmis", label: "İtirilmiş-tapılmış" },
];

/**
 * "Elan yerləşdir" — anonymous submission, always created Pending/Active
 * on the backend (spec §10). No account required.
 */
export function ListingSubmitForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    try {
      await listingsApi.create({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        category: form.get("category") as ClassifiedCategory,
        price: form.get("price") ? Number(form.get("price")) : null,
        location: String(form.get("location") ?? ""),
        contactName: String(form.get("contactName") ?? ""),
        contactInfo: String(form.get("contactInfo") ?? ""),
      });
      setStatus("done");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-stone-light bg-paper-soft p-6 text-center">
        <p className="font-display text-lg text-forest">Təşəkkür edirik!</p>
        <p className="mt-1 text-sm text-ink-soft">
          Elanınız göndərildi və moderatordan təsdiqləndikdən sonra dərc olunacaq.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Başlıq" htmlFor="title" required>
          <Input id="title" name="title" required maxLength={150} />
        </FormField>
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue="AlqiSatqi" required>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Təsvir" htmlFor="description" required>
        <Textarea id="description" name="description" required maxLength={4000} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Qiymət (₼)" htmlFor="price" hint="Boş buraxıla bilər">
          <Input id="price" name="price" type="number" min={0} step="0.01" />
        </FormField>
        <FormField label="Yer" htmlFor="location" required>
          <Input id="location" name="location" required maxLength={200} />
        </FormField>
        <FormField label="Ad, soyad" htmlFor="contactName" required>
          <Input id="contactName" name="contactName" required maxLength={100} />
        </FormField>
      </div>

      <FormField label="Əlaqə (telefon və ya e-poçt)" htmlFor="contactInfo" required>
        <Input id="contactInfo" name="contactInfo" required maxLength={200} />
      </FormField>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">
          Göndərmək mümkün olmadı. Backend hazırda əlçatan deyilsə, bir az sonra yenidən cəhd edin.
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={status === "submitting"} className="w-fit">
        Elanı göndər
      </Button>
    </form>
  );
}
