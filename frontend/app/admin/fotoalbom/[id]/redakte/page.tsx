import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoForm } from "@/components/admin/photos/PhotoForm";
import { PhotoRowActions } from "@/components/admin/photos/PhotoRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { photosApi } from "@/lib/api/photos";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Fotonu redaktə et — Admin — Musaküçə" };

export default async function AdminEditPhotoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let photo;
  try {
    photo = await photosApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu fotonu redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Fotonu yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Fotonu redaktə et"
        description={photo.title}
        breadcrumb={[{ label: "Fotoalbom", href: "/admin/fotoalbom" }, { label: photo.title }]}
        actions={<PhotoRowActions photo={photo} />}
      />
      <PhotoForm photo={photo} />
    </div>
  );
}
