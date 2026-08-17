import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InterviewForm } from "@/components/admin/interviews/InterviewForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { interviewsApi } from "@/lib/api/interviews";
import { getPersonOptions } from "@/lib/admin/personOptions";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Müsahibəni redaktə et — Admin — Musaküçə" };

export default async function AdminEditInterviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let interview;
  try {
    interview = await interviewsApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu müsahibəni redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Müsahibəni yükləmək mümkün olmadı" />;
  }

  const personOptions = await getPersonOptions();

  return (
    <div>
      <AdminPageHeader
        title="Müsahibəni redaktə et"
        description={interview.personName}
        breadcrumb={[{ label: "Kəndimizin səsi", href: "/admin/kendimizin-sesi" }, { label: interview.personName }]}
      />
      <InterviewForm interview={interview} personOptions={personOptions} />
    </div>
  );
}
