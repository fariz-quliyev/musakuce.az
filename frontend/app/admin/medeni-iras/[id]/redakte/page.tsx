import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CulturalHeritageForm } from "@/components/admin/culturalHeritage/CulturalHeritageForm";
import { CulturalHeritageRowActions } from "@/components/admin/culturalHeritage/CulturalHeritageRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Mədəni irs məzmununu redaktə et — Admin — Musaküçə" };

export default async function AdminEditCulturalHeritagePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let item;
  try {
    item = await culturalHeritageApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu məzmunu redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Məzmunu yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Mədəni irs məzmununu redaktə et"
        description={item.title}
        breadcrumb={[{ label: "Mədəni irs", href: "/admin/medeni-iras" }, { label: item.title }]}
        actions={<CulturalHeritageRowActions item={item} />}
      />
      <CulturalHeritageForm item={item} />
    </div>
  );
}
