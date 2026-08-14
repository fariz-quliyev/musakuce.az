"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { listingsApi } from "@/lib/api/listings";
import type { ListingDto } from "@/lib/api/types";

export function ListingModerationActions({ listing }: { listing: ListingDto }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      router.refresh();
      setRejecting(false);
      setReason("");
    } catch {
      setError("Əməliyyat uğursuz oldu.");
    } finally {
      setLoading(false);
    }
  }

  const canApprove = listing.moderationStatus !== "Approved";
  const canMarkSold = listing.moderationStatus === "Approved" && listing.listingStatus === "Active";
  const canReactivate = listing.moderationStatus === "Approved" && listing.listingStatus !== "Active";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stone-light bg-paper p-4">
      <h2 className="text-sm font-semibold text-ink">Moderasiya əməliyyatları</h2>

      {listing.rejectionReason ? (
        <p className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">
          Rədd səbəbi: {listing.rejectionReason}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canApprove ? (
          <Button
            type="button"
            size="sm"
            loading={loading}
            onClick={() => run(() => listingsApi.updateStatus(listing.id, { moderationStatus: "Approved" }))}
          >
            Təsdiqlə
          </Button>
        ) : null}

        {canMarkSold ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={loading}
            onClick={() => run(() => listingsApi.updateStatus(listing.id, { listingStatus: "Fulfilled" }))}
          >
            Satılıb/bağlı kimi qeyd et
          </Button>
        ) : null}

        {canReactivate ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={loading}
            onClick={() => run(() => listingsApi.updateStatus(listing.id, { listingStatus: "Active" }))}
          >
            Yenidən aktivləşdir
          </Button>
        ) : null}

        {listing.moderationStatus !== "Rejected" ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setRejecting((v) => !v)}>
            Rədd et
          </Button>
        ) : null}

        <Button type="button" size="sm" variant="ghost" href={`/admin/elanlar/${listing.id}/redakte`}>
          Redaktə et
        </Button>
      </div>

      {rejecting ? (
        <div className="flex flex-col gap-2 border-t border-stone-light pt-3">
          <Textarea
            id="rejection-reason"
            placeholder="Rədd səbəbini yazın (məcburidir)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              loading={loading}
              disabled={!reason.trim()}
              onClick={() =>
                run(() =>
                  listingsApi.updateStatus(listing.id, { moderationStatus: "Rejected", rejectionReason: reason }),
                )
              }
            >
              Rəddi təsdiqlə
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Ləğv et
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
