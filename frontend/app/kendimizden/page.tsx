import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { withFallback } from "@/lib/api/withFallback";
import { todayUpdates as MOCK_UPDATES } from "@/lib/mock-content";
import { fetchVillageUpdates } from "@/lib/villageUpdates";
import { formatRelativeTimeAz } from "@/lib/relativeTime";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Kəndimizdən",
  description: "Kənddə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər.",
  path: "/kendimizden",
});

const PAGE_SIZE = 12;

/**
 * The full "Kəndimizdən" feed (see lib/villageUpdates.ts) — the same
 * source as the homepage's "Son xəbərlər", just a larger page. Falls
 * back to the placeholder bulletin only if the API is unreachable.
 */
export default async function KendimizdenPage() {
  const { data: updates, isLive } = await withFallback(() => fetchVillageUpdates(PAGE_SIZE), MOCK_UPDATES);

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Kənd gündəliyi"
          title="Kəndimizdən"
          description="Kəndimizdə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər."
          className="mb-10"
        />

        {updates.length === 0 ? (
          <p className="text-ink-soft">Hələ heç bir yenilik yoxdur.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {updates.map((item) => {
              const itemTime = item.date ? formatRelativeTimeAz(item.date) : null;
              return (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-stone-light bg-paper shadow-sm"
                >
                  {item.kind === "photo" ? (
                    <div className="aspect-video w-full">
                      <VillagePhoto
                        src={item.image}
                        alt={item.title}
                        tone={item.tone ?? "warm"}
                        placeholderLabel={item.title}
                        sizes="(min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{item.category}</Badge>
                      {itemTime ? <span className="text-xs text-ink-faint">{itemTime}</span> : null}
                    </div>
                    <h3 className="font-display text-lg text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
