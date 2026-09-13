import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { ApiError } from "@/lib/api/client";
import { culturalHeritageKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import type { CulturalHeritageItemDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

async function loadItem(id: string): Promise<CulturalHeritageItemDto> {
  try {
    return await culturalHeritageApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await loadItem(id);
    return buildPageMetadata({
      title: item.title,
      description: item.description,
      path: `/medeniyyet/${item.id}`,
      imageUrl: item.coverImageUrl,
      type: "article",
    });
  } catch (error) {
    // notFound() inside loadItem() throws a framework interrupt, not an
    // application error, and this catch used to swallow it. The response
    // still had the right 404 status and body, but the not-found page's
    // metadata lost to the fallback below, so once the client hydrated
    // the tab title flipped to "Mədəni irs — Musaküçə". Rethrowing first
    // lets Next.js handle its own control flow; a genuine failure (backend
    // down, bad payload) still falls through to the graceful metadata.
    unstable_rethrow(error);
    return buildPageMetadata({ title: "Mədəni irs", description: "Musaküçə mədəni irs arxivi.", path: `/medeniyyet/${id}`, type: "article" });
  }
}

export default async function CulturalHeritageDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await loadItem(id);
  const breadcrumbItems = [
    { name: "Ana səhifə", path: "/" },
    { name: "Kəndimiz", path: "/kendimiz" },
    { name: "Mədəni irs", path: "/medeniyyet" },
    { name: item.title, path: `/medeniyyet/${item.id}` },
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd(breadcrumbItems),
            articleJsonLd({
              headline: item.title,
              description: item.description,
              url: `/medeniyyet/${item.id}`,
              imageUrl: item.coverImageUrl,
            }),
          ]),
        }}
      />
      <Container className="py-16 sm:py-20">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {item.coverImageUrl ? (
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-photo">
                <ZoomableImage src={item.coverImageUrl} alt={item.title}>
                  <VillagePhoto src={item.coverImageUrl} alt={item.title} tone="warm" placeholderLabel={item.title} />
                </ZoomableImage>
              </div>
            </div>
          ) : null}

          <div className={item.coverImageUrl ? "lg:col-span-6" : "lg:col-span-12 max-w-2xl"}>
            <Badge tone="gold">{culturalHeritageKindLabels[item.kind]}</Badge>

            <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
              {item.title}
            </h1>

            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-ink-soft">{item.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-light pt-5 text-xs text-ink-faint">
              <Badge tone="neutral">{sourceStatusLabels[item.sourceStatus]}</Badge>
              {item.sourceReference ? <span>{item.sourceReference}</span> : null}
            </div>

            <div className="mt-6">
              <SuggestionCta targetEntityType="CulturalHeritageItem" targetEntityId={item.id} />
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
