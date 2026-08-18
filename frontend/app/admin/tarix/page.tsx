import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { HistoryTable } from "@/components/admin/history/HistoryTable";
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
        actions={
          <div className="flex gap-2">
            <Button href="/admin/tarix/timeline" variant="outline">
              Timeline ayarları
            </Button>
            <Button href="/admin/tarix/yeni">+ Yeni qeyd</Button>
          </div>
        }
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/tarix" />

      <div className="mt-4">
        {result.items.length === 0 ? <EmptyState title="Bu statusda qeyd yoxdur" /> : <HistoryTable events={result.items} />}
      </div>
    </div>
  );
}
