import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { HistoryRowActions } from "@/components/admin/history/HistoryRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { historyApi } from "@/lib/api/history";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Tariximiz — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminTarixPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await historyApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Tarix qeydlərini idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Tarix qeydlərini yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Tariximiz"
        description="Kəndin tarixi xronologiyası."
        actions={<Button href="/admin/tarix/yeni">+ Yeni qeyd</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/tarix" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda qeyd yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Dövr</th>
                  <th className="px-4 py-3">Mənbə</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((event) => (
                  <tr key={event.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{event.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{event.period}</td>
                    <td className="px-4 py-3 text-ink-faint">{event.sourceReference ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={event.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/tarix/${event.id}/redakte?s=${event.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <HistoryRowActions event={event} />
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
