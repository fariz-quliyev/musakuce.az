import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { PlaceRowActions } from "@/components/admin/places/PlaceRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { placesApi } from "@/lib/api/places";
import { placeCategoryLabels, placeKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PlaceCategory, PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Yerlər — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

const CATEGORY_OPTIONS = Object.entries(placeCategoryLabels) as [PlaceCategory, string][];

type Props = { searchParams: Promise<{ status?: string; category?: string; search?: string }> };

export default async function AdminYerlerPage({ searchParams }: Props) {
  const { status, category, search } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await placesApi.getPaged({
      publicationStatus: tab,
      category: (category as PlaceCategory) || undefined,
      search: search || undefined,
      pageSize: 50,
    });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Yerləri idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Yerləri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Yerlər"
        description="Xəritədə göstərilən tarixi və faydalı məkanlar."
        actions={<Button href="/admin/yerler/yeni">+ Yeni yer</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/yerler" />

      <form method="GET" action="/admin/yerler" className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="status" value={tab} />
        <div className="min-w-[200px] flex-1">
          <Input name="search" placeholder="Ada görə axtar…" defaultValue={search ?? ""} aria-label="Axtar" />
        </div>
        <Select name="category" defaultValue={category ?? ""} aria-label="Kateqoriya" className="max-w-56">
          <option value="">Bütün kateqoriyalar</option>
          {CATEGORY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="sm">
          Filtrələ
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="Bu filtrə uyğun yer yoxdur"
          description={search || category ? "Filtri dəyişib yenidən cəhd edin." : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Kateqoriya</th>
                <th className="px-4 py-3">Koordinatlar</th>
                <th className="px-4 py-3">Mənbə</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Yenilənib</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((place) => (
                <tr key={place.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                  <td className="px-4 py-3 font-medium text-ink">
                    {place.name}
                    <span className="ml-2 text-xs font-normal text-ink-faint">{placeKindLabels[place.kind]}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {place.category ? placeCategoryLabels[place.category] : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-faint">
                    {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-faint">
                    {place.sourceStatus ? sourceStatusLabels[place.sourceStatus] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PublicationStatusBadge status={place.publicationStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-faint">
                    {new Date(place.updatedAt).toLocaleDateString("az-AZ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/yerler/${place.id}/redakte?s=${place.publicationStatus}`}
                        className="font-medium text-forest hover:underline"
                      >
                        Redaktə
                      </Link>
                      <PlaceRowActions place={place} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

