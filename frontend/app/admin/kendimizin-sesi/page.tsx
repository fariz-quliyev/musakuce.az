import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { InterviewRowActions } from "@/components/admin/interviews/InterviewRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { interviewsApi } from "@/lib/api/interviews";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Kəndimizin səsi — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminKendimizinSesiPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await interviewsApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Müsahibələri idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Müsahibələri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Kəndimizin səsi"
        description="Müsahibələr, xatirələr — səs və video."
        actions={<Button href="/admin/kendimizin-sesi/yeni">+ Yeni müsahibə</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/kendimizin-sesi" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda müsahibə yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Müsahib</th>
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((interview) => (
                  <tr key={interview.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{interview.personName}</td>
                    <td className="px-4 py-3 text-ink-soft">{interview.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={interview.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/kendimizin-sesi/${interview.id}/redakte?s=${interview.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <InterviewRowActions interview={interview} />
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
