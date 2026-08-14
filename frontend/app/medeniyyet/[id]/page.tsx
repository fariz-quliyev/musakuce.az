import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
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
    });
  } catch {
    return buildPageMetadata({ title: "Mədəni irs", description: "Musaküçə mədəni irs arxivi.", path: `/medeniyyet/${id}` });
  }
}

export default async function CulturalHeritageDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await loadItem(id);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "Mədəni irs", path: "/medeniyyet" },
              { name: item.title, path: `/medeniyyet/${item.id}` },
            ]),
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
        <Link href="/medeniyyet" className="text-sm text-ink-soft hover:text-forest">
          ← Mədəni irs arxivinə qayıt
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {item.coverImageUrl ? (
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-photo">
                <VillagePhoto src={item.coverImageUrl} alt={item.title} tone="warm" placeholderLabel={item.title} />
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
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
