"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { listingsApi } from "@/lib/api/listings";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import type { ClassifiedCategory, ListingDto } from "@/lib/api/types";

const CATEGORY_OPTIONS = Object.entries(classifiedCategoryLabels) as [ClassifiedCategory, string][];

export function ListingEditForm({ listing }: { listing: ListingDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);
    const imageUrls = String(form.get("imageUrls") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await listingsApi.update(listing.id, {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        category: form.get("category") as ClassifiedCategory,
        price: form.get("price") ? Number(form.get("price")) : null,
        location: String(form.get("location") ?? ""),
        contactName: String(form.get("contactName") ?? ""),
        contactInfo: String(form.get("contactInfo") ?? ""),
        imageUrls,
      });
      router.push(`/admin/elanlar/${listing.id}?m=${listing.moderationStatus}`);
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Başlıq" htmlFor="title" required>
          <Input id="title" name="title" required maxLength={150} defaultValue={listing.title} />
        </FormField>
        <FormField label="Kateqoriya" htmlFor="category" required>
          <Select id="category" name="category" defaultValue={listing.category} required>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Təsvir" htmlFor="description" required>
        <Textarea id="description" name="description" required maxLength={4000} defaultValue={listing.description} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Qiymət (₼)" htmlFor="price" hint="Boş buraxıla bilər">
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={listing.price ?? ""} />
        </FormField>
        <FormField label="Yer" htmlFor="location" required>
          <Input id="location" name="location" required maxLength={200} defaultValue={listing.location} />
        </FormField>
        <FormField label="Ad, soyad" htmlFor="contactName" required>
          <Input id="contactName" name="contactName" required maxLength={100} defaultValue={listing.contactName} />
        </FormField>
      </div>

      <FormField label="Əlaqə (telefon və ya e-poçt)" htmlFor="contactInfo" required>
        <Input id="contactInfo" name="contactInfo" required maxLength={200} defaultValue={listing.contactInfo} />
      </FormField>

      <FormField label="Şəkil URL-ləri" htmlFor="imageUrls" hint="Hər sətirdə bir URL">
        <Textarea id="imageUrls" name="imageUrls" defaultValue={listing.imageUrls.join("\n")} />
      </FormField>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href={`/admin/elanlar/${listing.id}?m=${listing.moderationStatus}`}>
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
