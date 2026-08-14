import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { todayUpdates } from "@/lib/mock-content";

export const metadata: Metadata = {
  title: "Kəndimizdən — Musaküçə",
  description: "Kənddə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər.",
};

/**
 * "Kəndimizdən" has no dedicated backend entity yet — the spec's
 * VillageUpdate content type wasn't in this phase's MVP priority list
 * (A–E), so this route is intentionally mock-data-only for now, kept
 * navigable and structurally ready for a future VillageUpdate API.
 */
export default function KendimizdenPage() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={false} />
        <SectionHeading
          as="h1"
          eyebrow="Kənd gündəliyi"
          title="Kəndimizdən"
          description="Kəndimizdə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər."
          className="mb-10"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {todayUpdates.map((item) => (
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
                  />
                </div>
              ) : null}
              <div className="p-5">
                <Badge tone="neutral" className="mb-2">
                  {item.category}
                </Badge>
                <h3 className="font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
