import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { PhotoRowActions } from "@/components/admin/photos/PhotoRowActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { photosApi } from "@/lib/api/photos";
import { photoCategoryLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus } from "@/lib/api/types";

export const metadata = { title: "Fotoalbom — Admin — Musaküçə" };

const TABS = [
  { label: "Qaralamalar", value: "Draft" },
  { label: "Dərc edilmiş", value: "Published" },
  { label: "Arxiv", value: "Archived" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminFotoalbomPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = (status ?? "Draft") as PublicationStatus;

  let result;
  try {
    result = await photosApi.getPaged({ publicationStatus: tab, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Fotoları idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Fotoları yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Fotoalbom"
        description="Foto arxivi."
        actions={<Button href="/admin/fotoalbom/yeni">+ Yeni foto</Button>}
      />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/fotoalbom" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu statusda foto yoxdur" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-lg border border-stone-light bg-paper">
                <div className="aspect-square bg-paper-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-only raw URL preview */}
                  <img src={photo.imageUrl} alt={photo.altText ?? ""} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-ink">{photo.title}</p>
                  <p className="text-xs text-ink-faint">{photoCategoryLabels[photo.category]}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <PublicationStatusBadge status={photo.publicationStatus} />
                    <Link
                      href={`/admin/fotoalbom/${photo.id}/redakte?s=${photo.publicationStatus}`}
                      className="text-xs font-medium text-forest hover:underline"
                    >
                      Redaktə
                    </Link>
                  </div>
                  <div className="mt-2">
                    <PhotoRowActions photo={photo} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
