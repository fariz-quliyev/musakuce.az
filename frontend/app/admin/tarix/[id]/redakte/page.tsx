import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HistoryForm } from "@/components/admin/history/HistoryForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { historyApi } from "@/lib/api/history";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Tarix qeydini redaktə et — Admin — Musaküçə" };

export default async function AdminEditHistoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let event;
  try {
    event = await historyApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu qeydi redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Qeydi yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader title="Tarix qeydini redaktə et" description={event.title} />
      <HistoryForm event={event} />
    </div>
  );
}
