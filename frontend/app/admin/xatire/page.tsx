import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { MemorialRowActions } from "@/components/admin/memorial/MemorialRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { memorialApi } from "@/lib/api/memorial";
import { memorialCategoryLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Xatirə — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminXatirePage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await memorialApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Xatirə qeydlərini idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Xatirə qeydlərini yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Xatirə"
        description="Müharibə iştirakçıları, şəhidlər, əlillər, Əmək qəhrəmanları."
        actions={<Button href="/admin/xatire/yeni">+ Yeni qeyd</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/xatire" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda qeyd yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Ad, soyad</th>
                  <th className="px-4 py-3">Kateqoriya</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((record) => (
                  <tr key={record.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{record.fullName}</td>
                    <td className="px-4 py-3 text-ink-soft">{memorialCategoryLabels[record.category]}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={record.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/xatire/${record.id}/redakte?s=${record.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <MemorialRowActions record={record} />
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
