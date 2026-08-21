import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ListingContactActions } from "@/components/listings/ListingContactActions";
import { listingsApi } from "@/lib/api/listings";
import { ApiError } from "@/lib/api/client";
import { classifiedCategoryLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import type { ListingDto } from "@/lib/api/types";

const LISTING_STATUS_LABELS: Record<ListingDto["listingStatus"], string> = {
  Active: "Aktiv",
  Fulfilled: "Satılıb / Tamamlanıb",
  Expired: "Vaxtı bitib",
  Removed: "Silinib",
};

type Props = { params: Promise<{ id: string }> };

async function loadListing(id: string): Promise<{ listing: ListingDto | null; failed: boolean }> {
  try {
    const listing = await listingsApi.getById(id);
    return { listing, failed: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { listing: null, failed: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { listing } = await loadListing(id);
  if (!listing) return buildPageMetadata({ title: "Elan", description: "Musaküçə elanlar lövhəsi.", path: `/elanlar/${id}` });
  return buildPageMetadata({
    title: listing.title,
    description: listing.description,
    path: `/elanlar/${listing.id}`,
    imageUrl: listing.imageUrls[0],
  });
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const { listing, failed } = await loadListing(id);

  return (
    <PageShell>
      {listing ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              breadcrumbJsonLd([
                { name: "Ana səhifə", path: "/" },
                { name: "Elanlar", path: "/elanlar" },
                { name: listing.title, path: `/elanlar/${listing.id}` },
              ]),
            ),
          }}
        />
      ) : null}
      <Container className="py-16 sm:py-20">
        {failed || !listing ? (
          <EmptyState
            tone="error"
            title="Elanı yükləmək mümkün olmadı"
            description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
            action={
              <Button href="/elanlar" size="sm">
                Elanlara qayıt
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="aspect-square overflow-hidden rounded-xl shadow-photo">
                {listing.imageUrls[0] ? (
                  <ZoomableImage src={listing.imageUrls[0]} alt={listing.title}>
                    <VillagePhoto src={listing.imageUrls[0]} alt={listing.title} tone="warm" placeholderLabel={classifiedCategoryLabels[listing.category]} />
                  </ZoomableImage>
                ) : (
                  <VillagePhoto tone="warm" alt={listing.title} placeholderLabel={classifiedCategoryLabels[listing.category]} />
                )}
              </div>
              {listing.imageUrls.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {listing.imageUrls.slice(1, 5).map((url) => (
                    <div key={url} className="aspect-square overflow-hidden rounded-md">
                      <ZoomableImage src={url} alt={listing.title}>
                        <VillagePhoto src={url} alt={listing.title} tone="warm" />
                      </ZoomableImage>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-6">
              <Link href="/elanlar" className="text-sm text-ink-soft hover:text-forest">
                ← Bütün elanlar
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone={listing.category === "ItirilmisTapilmis" ? "info" : "terracotta"}>
                  {classifiedCategoryLabels[listing.category]}
                </Badge>
                <Badge tone={listing.listingStatus === "Active" ? "success" : "neutral"}>
                  {LISTING_STATUS_LABELS[listing.listingStatus]}
                </Badge>
              </div>

              <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
                {listing.title}
              </h1>

              {listing.price ? (
                <p className="mt-3 font-display text-2xl text-forest">{listing.price} ₼</p>
              ) : null}

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                {listing.description}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-stone-light py-5 text-sm">
                <div>
                  <dt className="text-ink-faint">Yer</dt>
                  <dd className="mt-0.5 font-medium text-ink">{listing.location}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Tarix</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {new Date(listing.postedAt).toLocaleDateString("az-AZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <ListingContactActions contactName={listing.contactName} contactInfo={listing.contactInfo} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
