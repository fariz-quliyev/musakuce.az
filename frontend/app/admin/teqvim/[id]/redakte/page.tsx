import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventForm } from "@/components/admin/events/EventForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { eventsApi } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Tədbiri redaktə et — Admin — Musaküçə" };

export default async function AdminEditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let event;
  try {
    event = await eventsApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu tədbiri redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Tədbiri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Tədbiri redaktə et"
        description={event.title}
        breadcrumb={[{ label: "Təqvim", href: "/admin/teqvim" }, { label: event.title }]}
      />
      <EventForm event={event} />
    </div>
  );
}
