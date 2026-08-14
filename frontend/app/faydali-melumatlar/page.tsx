import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { localInfoApi } from "@/lib/api/localInfo";
import { withFallback } from "@/lib/api/withFallback";
import { localInfoKindLabels } from "@/lib/api/labels";
import type { LocalInfoEntryDto, LocalInfoKind, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Faydalı məlumatlar — Musaküçə",
  description: "Yerli xidmətlər, faydalı əlaqələr və tövsiyələr — elektrik ustası, aptek, taksi və digərləri.",
};

const FALLBACK: PagedResult<LocalInfoEntryDto> = {
  items: [
    {
      id: "mock-1",
      name: "Vaqif — Elektrik ustası",
      kind: "Service",
      category: "Elektrik",
      description: "Ev və təsərrüfat elektrik işləri.",
      contactInfo: null,
      areaServed: "Musaküçə",
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
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
    {
      id: "mock-3",
      name: "Aygün — Tikiş ustası",
      kind: "Craftsman",
      category: "Tikiş",
      description: null,
      contactInfo: null,
      areaServed: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 50,
  totalCount: 3,
  totalPages: 1,
};

const KIND_TABS: { value: LocalInfoKind | ""; label: string }[] = [
  { value: "", label: "Hamısı" },
  { value: "Service", label: localInfoKindLabels.Service },
  { value: "Contact", label: localInfoKindLabels.Contact },
  { value: "Shop", label: localInfoKindLabels.Shop },
  { value: "Craftsman", label: localInfoKindLabels.Craftsman },
  { value: "Transport", label: localInfoKindLabels.Transport },
  { value: "Recommendation", label: localInfoKindLabels.Recommendation },
];

type Props = { searchParams: Promise<{ kind?: string }> };

export default async function FaydaliMelumatlarPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const activeKind = (kind as LocalInfoKind | undefined) ?? undefined;

  const { data: entries, isLive } = await withFallback(
    () => localInfoApi.getPaged({ publicationStatus: "Published", kind: activeKind, pageSize: 50 }),
    activeKind ? { ...FALLBACK, items: FALLBACK.items.filter((e) => e.kind === activeKind) } : FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Kənd meydanı"
          title="Faydalı məlumatlar"
          description="Yerli xidmətlər, faydalı əlaqələr, ustalar və tövsiyələr — Yerli Faydalı Məlumatlar arxivindən."
          className="mb-8"
        />

        <div className="mb-8 flex flex-wrap gap-2">
          {KIND_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/faydali-melumatlar?kind=${tab.value}` : "/faydali-melumatlar"}
              className={
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
                ((activeKind ?? "") === tab.value
                  ? "border-forest bg-forest text-cream"
                  : "border-stone-light bg-paper text-ink-soft hover:border-forest hover:text-forest")
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <DataSourceNote isLive={isLive} />

        {entries.items.length === 0 ? (
          <EmptyState
            title="Bu kateqoriyada məlumat yoxdur"
            description="Başqa kateqoriya seçin və ya daha sonra yenidən yoxlayın."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.items.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-stone-light bg-paper p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base text-ink">{entry.name}</h3>
                  <Badge tone="neutral">{localInfoKindLabels[entry.kind]}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">{entry.category}</p>
                {entry.description ? (
                  <p className="mt-2 text-sm text-ink-soft">{entry.description}</p>
                ) : null}
                {entry.contactInfo ? (
                  <p className="mt-3 text-sm font-medium text-forest">{entry.contactInfo}</p>
                ) : null}
                {entry.areaServed ? (
                  <p className="mt-1 text-xs text-ink-faint">{entry.areaServed}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  );
}
