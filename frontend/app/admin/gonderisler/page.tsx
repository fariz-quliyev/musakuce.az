import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { SubmissionStatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { submissionsApi } from "@/lib/api/submissions";
import { submissionKindLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { SubmissionStatus } from "@/lib/api/types";

export const metadata = { title: "Göndərişlər — Admin — Musaküçə" };

const TABS = [
  { label: "Gözləyən", value: "Pending" },
  { label: "Təsdiqlənmiş", value: "Approved" },
  { label: "Rədd edilmiş", value: "Rejected" },
  { label: "Arxivə əlavə edilmiş", value: "Converted" },
  { label: "Arxivləşdirilmiş", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminGonderislerPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Pending") as SubmissionStatus;

  let result;
  try {
    result = await submissionsApi.getPaged({ status: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Göndərişlərə baxmaq üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Göndərişləri yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Göndərişlər"
        description="'Musaküçənin yaddaşına sən də əlavə et' vasitəsilə gələn foto, video, xatirə və tarixi məlumat göndərişləri."
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/gonderisler" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda göndəriş yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Növ</th>
                  <th className="px-4 py-3">Təsvir</th>
                  <th className="px-4 py-3">Göndərən</th>
                  <th className="px-4 py-3">Əlaqə</th>
                  <th className="px-4 py-3">Tarix</th>
                  <th className="px-4 py-3">Fayllar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((submission) => (
                  <tr key={submission.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{submissionKindLabels[submission.kind]}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{submission.description}</td>
                    <td className="px-4 py-3 text-ink-soft">{submission.submitterName}</td>
                    <td className="px-4 py-3 text-ink-soft">{submission.contactInfo}</td>
                    <td className="px-4 py-3 text-ink-faint">
                      {new Date(submission.createdAt).toLocaleDateString("az-AZ")}
                    </td>
                    <td className="px-4 py-3 text-ink-faint">{submission.fileUrls.length}</td>
                    <td className="px-4 py-3">
                      <SubmissionStatusBadge status={submission.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/gonderisler/${submission.id}`}
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
