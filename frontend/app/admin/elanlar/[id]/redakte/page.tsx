import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListingEditForm } from "@/components/admin/listings/ListingEditForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { listingsApi } from "@/lib/api/listings";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> };

export const metadata = { title: "Elanı redaktə et — Admin — Musaküçə" };

export default async function AdminListingEditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { m } = await searchParams;

  let listing;
  try {
    listing = await listingsApi.getById(id, m as "Pending" | "Approved" | "Rejected" | undefined);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu elanı redaktə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Elanı yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader title="Elanı redaktə et" description={listing.title} />
      <ListingEditForm listing={listing} />
    </div>
  );
}
