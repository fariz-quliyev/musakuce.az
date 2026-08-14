import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { EducationRowActions } from "@/components/admin/education/EducationRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { educationApi } from "@/lib/api/education";
import { educationKindLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Təhsil — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminTehsilPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await educationApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Təhsil məzmununu idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Təhsil məzmununu yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Təhsil"
        description="Məktəb tarixi, müəllimlər, məzunlar, nailiyyətlər."
        actions={<Button href="/admin/tehsil/yeni">+ Yeni qeyd</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/tehsil" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda qeyd yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Növ</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((entry) => (
                  <tr key={entry.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{entry.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{educationKindLabels[entry.kind]}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={entry.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/tehsil/${entry.id}/redakte?s=${entry.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <EducationRowActions entry={entry} />
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
