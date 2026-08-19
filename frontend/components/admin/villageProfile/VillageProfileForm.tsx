"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { AdminFormContainer } from "@/components/admin/shared/AdminFormContainer";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, SourceStatus, VillageProfileDto } from "@/lib/api/types";

const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

export function VillageProfileForm({ profile }: { profile?: VillageProfileDto | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [heroMediaAssetId, setHeroMediaAssetId] = useState<string | null>(profile?.heroMediaAssetId ?? null);
  const [logoMediaAssetId, setLogoMediaAssetId] = useState<string | null>(profile?.logoMediaAssetId ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const num = (name: string) => {
      const raw = String(form.get(name) ?? "");
      return raw === "" ? null : Number(raw);
    };

    const payload = {
      villageName: String(form.get("villageName") ?? ""),
      tagline: String(form.get("tagline") ?? "") || null,
      shortDescription: String(form.get("shortDescription") ?? ""),
      longDescription: String(form.get("longDescription") ?? "") || null,
      population: num("population"),
      populationAsOfYear: num("populationAsOfYear"),
      areaHectares: num("areaHectares"),
      geographicalDescription: String(form.get("geographicalDescription") ?? "") || null,
      mainOccupations: String(form.get("mainOccupations") ?? "") || null,
      neighboringSettlements: String(form.get("neighboringSettlements") ?? "") || null,
      nameOriginNarrative: String(form.get("nameOriginNarrative") ?? "") || null,
      nameOriginSourceStatus: (form.get("nameOriginSourceStatus") as SourceStatus) || null,
      nameOriginSourceReference: String(form.get("nameOriginSourceReference") ?? "") || null,
      latitude: num("latitude"),
      longitude: num("longitude"),
      heroMediaAssetId,
      ctaText: String(form.get("ctaText") ?? "") || null,
      ctaLink: String(form.get("ctaLink") ?? "") || null,
      logoMediaAssetId,
      contactInfo: String(form.get("contactInfo") ?? "") || null,
      socialLinks: String(form.get("socialLinks") ?? "") || null,
      editorialNote: String(form.get("editorialNote") ?? "") || null,
    };

    try {
      await villageProfileApi.upsert(payload);
      setStatus("success");
      router.push("/admin/kendimiz");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AdminFormContainer onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Kənd adı" htmlFor="villageName" hint="Boş buraxıla bilər">
          <Input id="villageName" name="villageName" maxLength={150} defaultValue={profile?.villageName ?? "Musaküçə"} />
        </FormField>
        <FormField label="Tanıtım cümləsi" htmlFor="tagline" hint="Boş buraxıla bilər">
          <Input id="tagline" name="tagline" maxLength={200} defaultValue={profile?.tagline ?? ""} />
        </FormField>
      </div>

      <FormField label="Qısa təsvir" htmlFor="shortDescription" hint="Baş səhifədə istifadə olunur — 1-2 cümlə, boş buraxıla bilər">
        <Textarea id="shortDescription" name="shortDescription" maxLength={500} defaultValue={profile?.shortDescription} />
      </FormField>

      <FormField label="Ətraflı təsvir" htmlFor="longDescription" hint="'Kəndimiz haqqında' bölməsi üçün tam mətn">
        <Textarea id="longDescription" name="longDescription" maxLength={8000} defaultValue={profile?.longDescription ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Əhali" htmlFor="population" hint="Boş buraxıla bilər">
          <Input id="population" name="population" type="number" min={0} defaultValue={profile?.population ?? ""} />
        </FormField>
        <FormField label="Hansı ilə aiddir" htmlFor="populationAsOfYear" hint="Məs. 2024">
          <Input id="populationAsOfYear" name="populationAsOfYear" type="number" defaultValue={profile?.populationAsOfYear ?? ""} />
        </FormField>
        <FormField label="Ərazi (hektar)" htmlFor="areaHectares" hint="Boş buraxıla bilər">
          <Input id="areaHectares" name="areaHectares" type="number" step="any" min={0} defaultValue={profile?.areaHectares ?? ""} />
        </FormField>
      </div>

      <FormField label="Coğrafi təsvir" htmlFor="geographicalDescription" hint="Dağlar, çaylar, relyef və s.">
        <Textarea id="geographicalDescription" name="geographicalDescription" maxLength={2000} defaultValue={profile?.geographicalDescription ?? ""} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Əsas məşğuliyyət" htmlFor="mainOccupations" hint="Boş buraxıla bilər">
          <Input id="mainOccupations" name="mainOccupations" maxLength={500} defaultValue={profile?.mainOccupations ?? ""} />
        </FormField>
        <FormField label="Qonşu yaşayış məntəqələri" htmlFor="neighboringSettlements" hint="Boş buraxıla bilər">
          <Input id="neighboringSettlements" name="neighboringSettlements" maxLength={500} defaultValue={profile?.neighboringSettlements ?? ""} />
        </FormField>
      </div>

      <div className="rounded-lg border border-stone-light bg-paper-soft p-4">
        <FormField
          label="Ad mənşəyi rəvayəti"
          htmlFor="nameOriginNarrative"
          hint="Adətən şifahi rəvayətdir — mənbə statusunu mütləq qeyd edin"
        >
          <Textarea id="nameOriginNarrative" name="nameOriginNarrative" maxLength={4000} defaultValue={profile?.nameOriginNarrative ?? ""} />
        </FormField>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormField label="Mənbə statusu" htmlFor="nameOriginSourceStatus" hint="Rəvayət daxil edildikdə tələb olunur">
            <Select id="nameOriginSourceStatus" name="nameOriginSourceStatus" defaultValue={profile?.nameOriginSourceStatus ?? ""}>
              <option value="">—</option>
              {SOURCE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Mənbə/istinad" htmlFor="nameOriginSourceReference" hint="Boş buraxıla bilər">
            <Input id="nameOriginSourceReference" name="nameOriginSourceReference" maxLength={500} defaultValue={profile?.nameOriginSourceReference ?? ""} />
          </FormField>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Enlik (latitude)" htmlFor="latitude" hint="Boş buraxıla bilər">
          <Input id="latitude" name="latitude" type="number" step="any" min={-90} max={90} defaultValue={profile?.latitude ?? ""} />
        </FormField>
        <FormField label="Uzunluq (longitude)" htmlFor="longitude" hint="Boş buraxıla bilər">
          <Input id="longitude" name="longitude" type="number" step="any" min={-180} max={180} defaultValue={profile?.longitude ?? ""} />
        </FormField>
      </div>

      <ImageUploadField
        label="Baş səkil (hero)"
        initialPreviewUrl={profile?.heroImageUrl}
        onUploaded={(media: MediaAssetDto) => setHeroMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Baş səhifə düyməsinin mətni" htmlFor="ctaText" hint="Boş buraxılsa, standart mətn görünür">
          <Input id="ctaText" name="ctaText" maxLength={60} defaultValue={profile?.ctaText ?? ""} />
        </FormField>
        <FormField label="Baş səhifə düyməsinin keçidi" htmlFor="ctaLink" hint="Məs. #kendimiz və ya /elanlar">
          <Input id="ctaLink" name="ctaLink" maxLength={300} defaultValue={profile?.ctaLink ?? ""} />
        </FormField>
      </div>

      <ImageUploadField
        label="Logo/emblem"
        initialPreviewUrl={profile?.logoImageUrl}
        onUploaded={(media: MediaAssetDto) => setLogoMediaAssetId(media.id)}
        hint="Boş buraxıla bilər"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Əlaqə məlumatı" htmlFor="contactInfo" hint="Boş buraxıla bilər">
          <Input id="contactInfo" name="contactInfo" maxLength={500} defaultValue={profile?.contactInfo ?? ""} />
        </FormField>
        <FormField label="Sosial şəbəkə keçidləri" htmlFor="socialLinks" hint="Boş buraxıla bilər">
          <Input id="socialLinks" name="socialLinks" maxLength={500} defaultValue={profile?.socialLinks ?? ""} />
        </FormField>
      </div>

      <FormField label="Redaktor qeydi" htmlFor="editorialNote" hint="Yalnız admin panelində görünür, saytda göstərilmir">
        <Textarea id="editorialNote" name="editorialNote" maxLength={2000} defaultValue={profile?.editorialNote ?? ""} />
      </FormField>

      {status === "success" ? (
        <p className="text-sm font-medium text-success">Uğurla saxlanıldı ✓</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
      </div>
    </AdminFormContainer>
  );
}
