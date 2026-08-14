import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PersonForm } from "@/components/admin/people/PersonForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Şəxsi redaktə et — Admin — Musaküçə" };

export default async function AdminEditPersonPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let person;
  try {
    person = await peopleApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu şəxsi redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Şəxsi yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader title="Şəxsi redaktə et" description={`${person.firstName} ${person.lastName}`} />
      <PersonForm person={person} />
    </div>
  );
}
