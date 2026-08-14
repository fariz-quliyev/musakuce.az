"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { placesApi } from "@/lib/api/places";
import { placeCategoryLabels, placeKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import type { MediaAssetDto, PlaceCategory, PlaceDto, PlaceKind, SourceStatus } from "@/lib/api/types";

const KIND_OPTIONS = Object.entries(placeKindLabels) as [PlaceKind, string][];
const CATEGORY_OPTIONS = Object.entries(placeCategoryLabels) as [PlaceCategory, string][];
const SOURCE_OPTIONS = Object.entries(sourceStatusLabels) as [SourceStatus, string][];

// Musaküçə village center — same Wikipedia-verified coordinates used by
// the public map and the homepage weather widget. Used only to prefill a
// sensible starting point for brand-new Places.
const DEFAULT_LATITUDE = 39.00861;
const DEFAULT_LONGITUDE = 48.69889;

const PlaceMapPicker = dynamic(() => import("./PlaceMapPicker").then((m) => m.PlaceMapPicker), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-md" />,
});

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function PlaceForm({ place }: { place?: PlaceDto }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [kind, setKind] = useState<PlaceKind>(place?.kind ?? "Useful");
  const [latitude, setLatitude] = useState(place?.latitude ?? DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(place?.longitude ?? DEFAULT_LONGITUDE);
  const [coverMediaAssetId, setCoverMediaAssetId] = useState<string | null>(place?.coverMediaAssetId ?? null);
  const isEdit = !!place;

  const latitudeError = !isValidLatitude(latitude) ? "-90 ilə 90 arasında olmalıdır" : undefined;
  const longitudeError = !isValidLongitude(longitude) ? "-180 ilə 180 arasında olmalıdır" : undefined;

  function handleUploaded(media: MediaAssetDto) {
    setCoverMediaAssetId(media.id);
  }

  function handlePickedOnMap(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return;

    setStatus("submitting");
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      kind,
      category: form.get("category") as PlaceCategory,
      description: String(form.get("description") ?? "") || null,
      historicalBackground: kind === "Historical" ? String(form.get("historicalBackground") ?? "") || null : null,
      latitude,
      longitude,
      coverMediaAssetId,
      sourceStatus: (form.get("sourceStatus") as SourceStatus) || null,
      sourceReference: String(form.get("sourceReference") ?? "") || null,
    };

    try {
      if (isEdit) {
        await placesApi.update(place.id, payload);
        router.push(`/admin/yerler/${place.id}/redakte?s=${place.publicationStatus}`);
      } else {
        const created = await placesApi.create(payload);
        router.push(`/admin/yerler/${created.id}/redakte?s=${created.publicationStatus}`);
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
          <Input id="name" name="name" required maxLength={150} defaultValue={place?.name} />
        </FormField>
        <FormField label="Növ" htmlFor="kind" required hint="Tarixi yer arxivə, faydalı məkan gündəlik xəritəyə aiddir">
          <Select id="kind" name="kind" required value={kind} onChange={(e) => setKind(e.target.value as PlaceKind)}>
            {KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Kateqoriya" htmlFor="category" required>
        <Select id="category" name="category" defaultValue={place?.category ?? "Other"} required>
          {CATEGORY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Təsvir" htmlFor="description" hint="Boş buraxıla bilər">
        <Textarea id="description" name="description" maxLength={4000} defaultValue={place?.description ?? ""} />
      </FormField>

      {kind === "Historical" ? (
        <FormField
          label="Tarixi məlumat"
          htmlFor="historicalBackground"
          hint="Yalnız tarixi yerlər üçün — mənbəyi 'Mənbə statusu' sahəsində qeyd edin"
        >
          <Textarea
            id="historicalBackground"
            name="historicalBackground"
            maxLength={4000}
            defaultValue={place?.historicalBackground ?? ""}
          />
        </FormField>
      ) : null}

      <div>
        <FormField
          label="Koordinatlar"
          htmlFor="latitudeInput"
          required
          hint="Rəqəmləri əl ilə daxil edin və ya aşağıdakı xəritədə klikləyib seçin"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="latitudeInput"
              type="number"
              step="any"
              min={-90}
              max={90}
              required
              placeholder="Enlik (latitude)"
              value={Number.isNaN(latitude) ? "" : latitude}
              error={latitudeError}
              onChange={(e) => setLatitude(e.target.valueAsNumber)}
            />
            <Input
              type="number"
              step="any"
              min={-180}
              max={180}
              required
              placeholder="Uzunluq (longitude)"
              value={Number.isNaN(longitude) ? "" : longitude}
              error={longitudeError}
              onChange={(e) => setLongitude(e.target.valueAsNumber)}
            />
          </div>
        </FormField>
        <div className="mt-2 h-56 w-full overflow-hidden rounded-md border border-stone-light">
          <PlaceMapPicker latitude={latitude} longitude={longitude} onChange={handlePickedOnMap} />
        </div>
      </div>

      <ImageUploadField
        label="Şəkil"
        initialPreviewUrl={place?.coverImageUrl}
        onUploaded={handleUploaded}
        hint="Boş buraxıla bilər — JPEG, PNG, WebP və ya AVIF, maks. 15 MB"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Mənbə statusu"
          htmlFor="sourceStatus"
          required={kind === "Historical"}
          hint={kind === "Historical" ? "Şifahi rəvayəti təsdiqlənmiş fakt kimi göstərməyin" : "Boş buraxıla bilər"}
        >
          <Select
            id="sourceStatus"
            name="sourceStatus"
            defaultValue={place?.sourceStatus ?? (kind === "Historical" ? "UnderResearch" : "")}
            required={kind === "Historical"}
          >
            {kind !== "Historical" ? <option value="">—</option> : null}
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Mənbə/istinad" htmlFor="sourceReference" hint="Məs. 'Ailə arxivi, Səlim baba ilə söhbət, 2020'">
          <Input id="sourceReference" name="sourceReference" maxLength={500} defaultValue={place?.sourceReference ?? ""} />
        </FormField>
      </div>

      {status === "error" ? (
        <p className="text-sm font-medium text-danger">Yadda saxlamaq mümkün olmadı.</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" loading={status === "submitting"}>
          Yadda saxla
        </Button>
        <Button type="button" variant="outline" href="/admin/yerler">
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
