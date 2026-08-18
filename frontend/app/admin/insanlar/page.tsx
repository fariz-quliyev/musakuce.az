import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { PersonRowActions } from "@/components/admin/people/PersonRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { peopleApi } from "@/lib/api/people";
import { personCategoryLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "İnsanlarımız — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminInsanlarPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await peopleApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Şəxsləri idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Şəxsləri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="İnsanlarımız"
        description="Kəndin tanınmış şəxsləri."
        actions={<Button href="/admin/insanlar/yeni">+ Yeni şəxs</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/insanlar" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda şəxs yoxdur" />
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
                {result.items.map((person) => (
                  <tr key={person.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link
                        href={`/admin/insanlar/${person.id}/redakte?s=${person.publicationStatus}`}
                        className="hover:underline"
                      >
                        {person.firstName} {person.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{personCategoryLabels[person.category]}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={person.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <PersonRowActions person={person} />
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
