import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle, CardMeta } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import type { ListingDto } from "@/lib/api/types";

const LISTING_STATUS_LABELS: Record<ListingDto["listingStatus"], string> = {
  Active: "Aktiv",
  Fulfilled: "Satılıb / Tamamlanıb",
  Expired: "Vaxtı bitib",
  Removed: "Silinib",
};

export function ListingCard({ listing }: { listing: ListingDto }) {
  return (
    <Link href={`/elanlar/${listing.id}`} className="block">
      <Card variant="square" className="h-full transition-shadow hover:shadow-md">
        <CardMedia aspect="square">
          <VillagePhoto
            src={listing.imageUrls[0]}
            alt={listing.title}
            tone="warm"
            placeholderLabel={classifiedCategoryLabels[listing.category]}
          />
        </CardMedia>
        <CardBody>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={listing.category === "ItirilmisTapilmis" ? "info" : "terracotta"}>
              {classifiedCategoryLabels[listing.category]}
            </Badge>
            {listing.listingStatus !== "Active" ? (
              <Badge tone="neutral">{LISTING_STATUS_LABELS[listing.listingStatus]}</Badge>
            ) : null}
          </div>
          <CardTitle className="mt-2 text-base">{listing.title}</CardTitle>
          <CardMeta className="mt-3">
            {listing.price ? (
              <span className="font-semibold text-ink">{listing.price} ₼</span>
            ) : null}
            <span>{listing.location}</span>
          </CardMeta>
        </CardBody>
      </Card>
    </Link>
  );
}
