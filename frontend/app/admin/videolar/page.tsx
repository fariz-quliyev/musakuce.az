import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { VideoRowActions } from "@/components/admin/videos/VideoRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { videosApi } from "@/lib/api/videos";
import { videoEmbedProviderLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Videolar — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminVideolarPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await videosApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Videoları idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Videoları yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Videolar"
        description="Video arxivi — yükləmə yoxdur, yalnız embed URL."
        actions={<Button href="/admin/videolar/yeni">+ Yeni video</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/videolar" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda video yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Provayder</th>
                  <th className="px-4 py-3">Kateqoriya</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((video) => (
                  <tr key={video.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{video.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{videoEmbedProviderLabels[video.embedProvider]}</td>
                    <td className="px-4 py-3 text-ink-faint">{video.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PublicationStatusBadge status={video.publicationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/videolar/${video.id}/redakte?s=${video.publicationStatus}`}
                          className="font-medium text-forest hover:underline"
                        >
                          Redaktə
                        </Link>
                        <VideoRowActions video={video} />
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
