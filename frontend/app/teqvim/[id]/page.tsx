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
import { eventsApi } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { eventCategoryLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, eventJsonLd, jsonLdScript } from "@/lib/structuredData";
import type { EventDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

async function loadEvent(id: string): Promise<{ event: EventDto | null; failed: boolean }> {
  try {
    const event = await eventsApi.getById(id);
    return { event, failed: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { event: null, failed: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { event } = await loadEvent(id);
  if (!event) return buildPageMetadata({ title: "Tədbir", description: "Musaküçə təqvimi.", path: `/teqvim/${id}` });
  return buildPageMetadata({
    title: event.title,
    description: event.description,
    path: `/teqvim/${event.id}`,
    imageUrl: event.coverImageUrl,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const { event, failed } = await loadEvent(id);

  return (
    <PageShell>
      {event ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript([
              breadcrumbJsonLd([
                { name: "Ana səhifə", path: "/" },
                { name: "Təqvim", path: "/teqvim" },
                { name: event.title, path: `/teqvim/${event.id}` },
              ]),
              eventJsonLd({
                name: event.title,
                description: event.description,
                startDate: event.startsAt,
                endDate: event.endsAt,
                location: event.location,
                url: `/teqvim/${event.id}`,
              }),
            ]),
          }}
        />
      ) : null}
      <Container className="py-16 sm:py-20">
        {failed || !event ? (
          <EmptyState
            tone="error"
            title="Tədbiri yükləmək mümkün olmadı"
            description="Backend ilə əlaqə yaratmaq mümkün olmadı. Bir az sonra yenidən cəhd edin."
            action={
              <Button href="/teqvim" size="sm">
                Təqvimə qayıt
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="aspect-square overflow-hidden rounded-xl shadow-photo">
                {event.coverImageUrl ? (
                  <ZoomableImage src={event.coverImageUrl} alt={event.title}>
                    <VillagePhoto src={event.coverImageUrl} alt={event.title} tone="forest" placeholderLabel={eventCategoryLabels[event.category]} />
                  </ZoomableImage>
                ) : (
                  <VillagePhoto tone="forest" alt={event.title} placeholderLabel={eventCategoryLabels[event.category]} />
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Link href="/teqvim" className="text-sm text-ink-soft hover:text-forest">
                ← Bütün tədbirlər
              </Link>

              <Badge tone="neutral" className="mt-4">
                {eventCategoryLabels[event.category]}
              </Badge>

              <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
                {event.title}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                {event.description}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-stone-light py-5 text-sm">
                <div>
                  <dt className="text-ink-faint">Tarix</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {new Date(event.startsAt).toLocaleDateString("az-AZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Vaxt</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {new Date(event.startsAt).toLocaleTimeString("az-AZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {event.endsAt
                      ? ` – ${new Date(event.endsAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Yer</dt>
                  <dd className="mt-0.5 font-medium text-ink">{event.location}</dd>
                </div>
                {event.organizerName ? (
                  <div>
                    <dt className="text-ink-faint">Təşkilatçı</dt>
                    <dd className="mt-0.5 font-medium text-ink">{event.organizerName}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
