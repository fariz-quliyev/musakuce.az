import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { ListingStatusBadge, ModerationStatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { listingsApi } from "@/lib/api/listings";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { ListingQuery } from "@/lib/api/types";

export const metadata = { title: "Elanlar — Admin — Musaküçə" };

const TABS = [
  { label: "Gözləyən", value: "Pending" },
  { label: "Təsdiqlənmiş", value: "Approved" },
  { label: "Rədd edilmiş", value: "Rejected" },
  { label: "Satılıb/Bağlı", value: "Sold" },
  { label: "Vaxtı bitmiş", value: "Expired" },
];

function queryForTab(tab: string): ListingQuery {
  switch (tab) {
    case "Approved":
      return { moderationStatus: "Approved", listingStatus: "Active" };
    case "Rejected":
      return { moderationStatus: "Rejected" };
    case "Sold":
      return { moderationStatus: "Approved", listingStatus: "Fulfilled" };
    case "Expired":
      return { listingStatus: "Expired" };
    case "Pending":
    default:
      return { moderationStatus: "Pending" };
  }
}

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminElanlarPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const tab = status ?? "Pending";

  const query = queryForTab(tab);
  let result;
  try {
    result = await listingsApi.getPaged({ ...query, pageSize: 50 });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Elanları idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Elanları yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader title="Elanlar" description="Elanların moderasiyası. Bu bölmə ictimai saytda görünmür." />

      <StatusTabs tabs={TABS} active={tab} basePath="/admin/elanlar" />

      <div className="mt-4">
        {result.items.length === 0 ? (
          <EmptyState title="Bu kateqoriyada elan yoxdur" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Başlıq</th>
                  <th className="px-4 py-3">Kateqoriya</th>
                  <th className="px-4 py-3">Qiymət</th>
                  <th className="px-4 py-3">Moderasiya</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tarix</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.items.map((listing) => (
                  <tr key={listing.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 font-medium text-ink">{listing.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{classifiedCategoryLabels[listing.category]}</td>
                    <td className="px-4 py-3 text-ink-soft">{listing.price ? `${listing.price} ₼` : "—"}</td>
                    <td className="px-4 py-3">
                      <ModerationStatusBadge status={listing.moderationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <ListingStatusBadge status={listing.listingStatus} />
                    </td>
                    <td className="px-4 py-3 text-ink-faint">
                      {new Date(listing.postedAt).toLocaleDateString("az-AZ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/elanlar/${listing.id}?m=${query.moderationStatus ?? "Approved"}`}
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
