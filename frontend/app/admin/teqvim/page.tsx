import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { EventRowActions } from "@/components/admin/events/EventRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { eventsApi } from "@/lib/api/events";
import { eventCategoryLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Təqvim — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminTeqvimPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await eventsApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Tədbirləri idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Tədbirləri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Təqvim"
        description="Kənd tədbirləri."
        actions={<Button href="/admin/teqvim/yeni">+ Yeni tədbir</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/teqvim" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda tədbir yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Kateqoriya</th>
                  <th className="px-4 py-3">Tarix</th>
                  <th className="px-4 py-3">Yer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((event) => (
                  <tr key={event.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{event.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{eventCategoryLabels[event.category]}</td>
                    <td className="px-4 py-3 text-ink-faint">
                      {new Date(event.startsAt).toLocaleDateString("az-AZ")}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{event.location}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={event.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/teqvim/${event.id}/redakte?s=${event.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <EventRowActions event={event} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
