import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EducationForm } from "@/components/admin/education/EducationForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { educationApi } from "@/lib/api/education";
import { getPersonOptions } from "@/lib/admin/personOptions";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Təhsil qeydini redaktə et — Admin — Musaküçə" };

export default async function AdminEditEducationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let entry;
  try {
    entry = await educationApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu qeydi redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Qeydi yükləmək mümkün olmadı" />;
  }

  const personOptions = await getPersonOptions();

  return (
    <div>
      <AdminPageHeader
        title="Təhsil qeydini redaktə et"
        description={entry.title}
        breadcrumb={[{ label: "Təhsil", href: "/admin/tehsil" }, { label: entry.title }]}
      />
      <EducationForm entry={entry} personOptions={personOptions} />
    </div>
  );
}
