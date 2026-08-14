import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { localInfoApi } from "@/lib/api/localInfo";
import { withFallback } from "@/lib/api/withFallback";
import { localInfoKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import type { LocalInfoEntryDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Kəndimiz — Musaküçə",
  description: "Musaküçə haqqında: coğrafiya, əhali və yerli faydalı məlumatlar.",
};

const FALLBACK: PagedResult<LocalInfoEntryDto> = {
  items: [
    {
      id: "mock-1",
      name: "Vaqif — Elektrik ustası",
      kind: "Service",
      category: "Elektrik",
      description: null,
      contactInfo: null,
      areaServed: null,
      photoMediaAssetId: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
    {
      id: "mock-2",
      name: "Mərkəz aptek",
      kind: "Contact",
      category: "Səhiyyə",
      description: null,
      contactInfo: null,
      areaServed: null,
      photoMediaAssetId: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 20,
  totalCount: 2,
  totalPages: 1,
};

export default async function KendimizPage() {
  const [{ data: localInfo, isLive }, { data: profile }] = await Promise.all([
    withFallback(() => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 20 }), FALLBACK),
    withFallback(() => villageProfileApi.get(), VILLAGE_PROFILE_FALLBACK),
  ]);

  const facts: { label: string; value: string; note: string }[] = [];
  if (profile.population) {
    facts.push({
      label: "Əhali",
      value: profile.population.toLocaleString("az-AZ"),
      note: profile.populationAsOfYear ? `nəfər, ${profile.populationAsOfYear}` : "nəfər",
    });
  }
  if (profile.areaHectares) {
    facts.push({ label: "Ərazi", value: profile.areaHectares.toLocaleString("az-AZ"), note: "hektar" });
  }
  if (profile.neighboringSettlements) {
    facts.push({ label: "Qonşu yaşayış məntəqələri", value: profile.neighboringSettlements, note: "" });
  }

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Musaküçə haqqında"
          title="Kəndimiz"
          description={profile.tagline ?? undefined}
          className="mb-8"
        />
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
          {profile.geographicalDescription ?? profile.longDescription ?? profile.shortDescription}
        </p>

        {profile.nameOriginNarrative ? (
          <div className="mt-8 max-w-2xl rounded-lg border border-stone-light bg-paper-soft p-5">
            <h2 className="font-display text-[length:var(--text-h4)] text-ink">Adın mənşəyi</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{profile.nameOriginNarrative}</p>
            {profile.nameOriginSourceStatus ? (
              <Badge tone="terracotta" className="mt-3">
                {sourceStatusLabels[profile.nameOriginSourceStatus]}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {facts.length > 0 ? (
          <div className="my-12 grid grid-cols-2 gap-x-6 gap-y-8 rounded-xl border border-stone-light bg-cream-deep p-8 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="text-center sm:text-left">
                <p className="font-display text-[length:var(--text-h2)] leading-none text-forest">{fact.value}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{fact.label}</p>
                {fact.note ? <p className="text-xs text-ink-faint">{fact.note}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-4 mt-12">
          <DataSourceNote isLive={isLive} />
          <h2 className="font-display text-[length:var(--text-h3)] text-ink">
            Yerli faydalı məlumatlar
          </h2>
        </div>

        {localInfo.items.length === 0 ? (
          <EmptyState title="Hələ məlumat əlavə edilməyib" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {localInfo.items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-light bg-paper p-4"
              >
                <span className="text-sm font-medium text-ink">{entry.name}</span>
                <Badge tone="neutral">{localInfoKindLabels[entry.kind]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  );
}
