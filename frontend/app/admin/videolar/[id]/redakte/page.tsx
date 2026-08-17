import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoForm } from "@/components/admin/videos/VideoForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { videosApi } from "@/lib/api/videos";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Videonu redaktə et — Admin — Musaküçə" };

export default async function AdminEditVideoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let video;
  try {
    video = await videosApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu videonu redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Videonu yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Videonu redaktə et"
        description={video.title}
        breadcrumb={[{ label: "Videolar", href: "/admin/videolar" }, { label: video.title }]}
      />
      <VideoForm video={video} />
    </div>
  );
}
