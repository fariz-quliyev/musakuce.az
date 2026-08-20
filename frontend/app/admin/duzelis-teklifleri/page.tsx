import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { ModerationStatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { correctionsApi } from "@/lib/api/corrections";
import { targetEntityTypeLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { ModerationStatus } from "@/lib/api/types";

export const metadata = { title: "Düzəliş təklifləri — Admin — Musaküçə" };

const TABS = [
  { label: "Gözləyən", value: "Pending" },
  { label: "Təsdiqlənmiş", value: "Approved" },
  { label: "Rədd edilmiş", value: "Rejected" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminCorrectionsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Pending") as ModerationStatus;

  let result;
  try {
    result = await correctionsApi.getPaged({ status: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Düzəliş təkliflərinə baxmaq üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Düzəliş təkliflərini yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Düzəliş təklifləri"
        description="Oxucuların ictimai səhifələrdəki 'Düzəliş təklif et' düyməsi vasitəsilə göndərdiyi korreksiya, əlavə məlumat və foto təklifləri."
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/duzelis-teklifleri" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda təklif yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Məzmun növü</th>
                  <th className="px-4 py-3">Aid olduğu qeyd</th>
                  <th className="px-4 py-3">Göndərən</th>
                  <th className="px-4 py-3">Tarix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((suggestion) => (
                  <tr key={suggestion.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{targetEntityTypeLabels[suggestion.targetEntityType]}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{suggestion.targetTitle}</td>
                    <td className="px-4 py-3 text-ink-soft">{suggestion.submitterName ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-faint">
                      {new Date(suggestion.createdAt).toLocaleDateString("az-AZ")}
                    </td>
                    <td className="px-4 py-3">
                      <ModerationStatusBadge status={suggestion.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/duzelis-teklifleri/${suggestion.id}`}
                        className="font-medium text-forest hover:underline"
                      >
                        Bax →
                      </Link>
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
