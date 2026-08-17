import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListingStatusBadge, ModerationStatusBadge } from "@/components/admin/StatusBadge";
import { ListingModerationActions } from "@/components/admin/listings/ListingModerationActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { listingsApi } from "@/lib/api/listings";
import { ApiError } from "@/lib/api/client";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { ModerationStatus } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> };

export const metadata = { title: "Elan — Admin — Musaküçə" };

export default async function AdminListingDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { m } = await searchParams;

  let listing;
  try {
    listing = await listingsApi.getById(id, m as ModerationStatus | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu elana baxmaq üçün icazəniz yoxdur." />;
    }
    return (
      <EmptyState tone="error" title="Elanı yükləmək mümkün olmadı" description="Backend ilə əlaqə yaratmaq mümkün olmadı." />
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={listing.title}
        description={`${classifiedCategoryLabels[listing.category]} · ${listing.location}`}
        breadcrumb={[{ label: "Elanlar", href: "/admin/elanlar" }, { label: listing.title }]}
        actions={
          <div className="flex gap-2">
            <ModerationStatusBadge status={listing.moderationStatus} />
            <ListingStatusBadge status={listing.listingStatus} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-stone-light bg-paper p-5">
            <h2 className="text-sm font-semibold text-ink">Təsvir</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{listing.description}</p>

            {listing.price ? (
              <p className="mt-4 text-lg font-bold text-forest">{listing.price} ₼</p>
            ) : null}

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-stone-light pt-4 text-sm">
              <div>
                <dt className="text-ink-faint">Yerləşdirilib</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {new Date(listing.postedAt).toLocaleDateString("az-AZ")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Bitmə tarixi</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {new Date(listing.expiresAt).toLocaleDateString("az-AZ")}
                </dd>
              </div>
            </dl>
          </div>

          {listing.imageUrls.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {listing.imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element -- admin-only raw URL preview, no next/image optimization needed
                <img key={url} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-ink-faint">Şəkil əlavə edilməyib.</p>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-lg border border-stone-light bg-paper p-4">
            <h2 className="text-sm font-semibold text-ink">Əlaqə məlumatları</h2>
            <dl className="mt-2 grid gap-2 text-sm">
              <div>
                <dt className="text-ink-faint">Ad, soyad</dt>
                <dd className="font-medium text-ink">{listing.contactName}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Əlaqə</dt>
                <dd className="font-medium text-ink">{listing.contactInfo}</dd>
              </div>
            </dl>
          </div>

          <ListingModerationActions listing={listing} />
        </div>
      </div>
    </div>
  );
}
