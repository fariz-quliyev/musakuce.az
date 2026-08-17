import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlaceForm } from "@/components/admin/places/PlaceForm";
import { PlaceRowActions } from "@/components/admin/places/PlaceRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { placesApi } from "@/lib/api/places";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Yeri redaktə et — Admin — Musaküçə" };

export default async function AdminEditPlacePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let place;
  try {
    place = await placesApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu yeri redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Yeri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Yeri redaktə et"
        description={place.name}
        breadcrumb={[{ label: "Məkanlar", href: "/admin/yerler" }, { label: place.name }]}
        actions={<PlaceRowActions place={place} />}
      />
      <PlaceForm place={place} />
    </div>
  );
}
