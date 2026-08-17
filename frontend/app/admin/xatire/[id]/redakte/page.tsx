import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemorialForm } from "@/components/admin/memorial/MemorialForm";
import { MemorialRowActions } from "@/components/admin/memorial/MemorialRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { memorialApi } from "@/lib/api/memorial";
import { authApi } from "@/lib/api/auth";
import { getPersonOptions } from "@/lib/admin/personOptions";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ s?: string }> };

export const metadata = { title: "Xatirə qeydini redaktə et — Admin — Musaküçə" };

export default async function AdminEditMemorialPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { s } = await searchParams;

  let record;
  try {
    record = await memorialApi.getById(id, s as PublicationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu qeydi redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Qeydi yükləmək mümkün olmadı" />;
  }

  const personOptions = await getPersonOptions();
  // UX only — see MemorialRowActions' doc comment; the API independently
  // re-checks memorial.moderate regardless of what this renders.
  const user = await authApi.me().catch(() => null);
  const canModerate = user?.permissions.includes("memorial.moderate") ?? false;

  return (
    <div>
      <AdminPageHeader
        title="Xatirə qeydini redaktə et"
        description={record.fullName}
        breadcrumb={[{ label: "Xatirə", href: "/admin/xatire" }, { label: record.fullName }]}
        actions={<MemorialRowActions record={record} canModerate={canModerate} />}
      />
      <MemorialForm record={record} personOptions={personOptions} />
    </div>
  );
}
