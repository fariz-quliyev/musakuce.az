import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListingSubmitForm } from "@/components/forms/ListingSubmitForm";
import { ListingsBrowser } from "@/components/listings/ListingsBrowser";
import { listingsApi } from "@/lib/api/listings";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { ClassifiedCategory, ListingDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Elanlar",
  description: "Kəndin elanlar taxtası: alqı-satqı, xidmətlər, itirilmiş-tapılmış.",
  path: "/elanlar",
});

const FALLBACK: PagedResult<ListingDto> = {
  items: [
    {
      id: "mock-1",
      title: "Süd inəyi satılır",
      description: "Sağlam, məhsuldar inək satılır.",
      category: "MalQara",
      price: 1200,
      location: "Musaküçə",
      contactName: "Nümunə sakin",
      contactInfo: "+994 xx xxx xx xx",
      listingStatus: "Active",
      moderationStatus: "Approved",
      rejectionReason: null,
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      imageUrls: [],
    },
    {
      id: "mock-2",
      title: "Kombayn xidməti göstərilir",
      description: "Payızlıq sahələr üçün kombayn xidməti.",
      category: "Xidmet",
      price: null,
      location: "Musaküçə və ətrafı",
      contactName: "Nümunə sakin",
      contactInfo: "+994 xx xxx xx xx",
      listingStatus: "Active",
      moderationStatus: "Approved",
      rejectionReason: null,
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      imageUrls: [],
    },
  ],
  page: 1,
  pageSize: 12,
  totalCount: 2,
  totalPages: 1,
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ElanlarPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const initialCategory = category as ClassifiedCategory | undefined;

  const { data: listings, isLive } = await withFallback(
    () => listingsApi.getPaged({ listingStatus: "Active", pageSize: 12, category: initialCategory }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Kənd meydanı"
          title="Elanlar"
          description="Kəndin elanlar taxtası — bu sayt yalnız kənd haqqında məlumat vermir, kənd sakinləri bundan gündəlik istifadə edə bilər."
          className="mb-10"
        />

        <ListingsBrowser
          initialData={listings}
          initialIsLive={isLive}
          initialCategory={initialCategory}
        />

        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-stone-light bg-paper-soft p-6 sm:p-10">
          <h2 className="font-display text-[length:var(--text-h3)] text-ink">Elan yerləşdir</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Elanınız moderatordan təsdiqləndikdən sonra dərc olunacaq.
          </p>
          <div className="mt-6">
            <ListingSubmitForm />
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
