import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
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

/** Small line icons for the "Rəqəmlərlə Musaküçə" stat cards — inline so
 * the section doesn't need a new shared icon component for two glyphs. */
function PopulationIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 13.5h16M13.5 4v16" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}

const HISTORY_LINKS = [
  {
    href: "/tariximiz",
    label: "Tariximiz",
    description: "Kəndin yaranışından bu günə mühüm tarixlər",
  },
  {
    href: "/insanlarimiz",
    label: "İnsanlarımız",
    description: "Musaküçəni tanıdan adlar",
  },
  {
    href: "/fotoalbom",
    label: "Fotoalbom",
    description: "Köhnə və müasir Musaküçədən şəkillər",
  },
];

export default async function KendimizPage() {
  const [{ data: localInfo, isLive: localInfoIsLive }, { data: profile, isLive: profileIsLive }] = await Promise.all([
    withFallback(() => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 20 }), FALLBACK),
    withFallback(() => villageProfileApi.get(), VILLAGE_PROFILE_FALLBACK),
  ]);

  const heroAlt = profile.heroImageUrl ? profile.villageName : "Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)";

  const stats: { label: string; value: string; note: string; icon: React.ReactNode }[] = [];
  if (profile.population) {
    stats.push({
      label: "Əhali",
      value: profile.population.toLocaleString("az-AZ"),
      note: profile.populationAsOfYear ? `nəfər, ${profile.populationAsOfYear}` : "nəfər",
      icon: <PopulationIcon />,
    });
  }
  if (profile.areaHectares) {
    stats.push({
      label: "Ərazi",
      value: profile.areaHectares.toLocaleString("az-AZ"),
      note: "hektar",
      icon: <AreaIcon />,
    });
  }

  const hasLongText = Boolean(profile.longDescription && profile.longDescription !== profile.shortDescription);
  const showGeography = Boolean(profile.geographicalDescription || profile.neighboringSettlements);
  const hasCoordinates = profile.latitude != null && profile.longitude != null;

  return (
    <PageShell>
      {/* A — Hero/Intro */}
      <Container as="section" className="pt-14 pb-4 sm:pt-20">
        {!profileIsLive ? <DataSourceNote isLive={profileIsLive} /> : null}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading as="h1" eyebrow="Musaküçə haqqında" title={profile.villageName} description={profile.tagline ?? undefined} />
          </div>
          <div className="aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-lg sm:aspect-[16/10] lg:aspect-[4/5]">
            <VillagePhoto
              src={profile.heroImageUrl ?? "/images/village/hero-demo.jpg"}
              alt={heroAlt}
              tone="forest"
              variant="scene"
              placeholderLabel="Musaküçə mənzərəsi əlavə olunacaq"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>
        </div>
      </Container>

      {/* B — Rəqəmlərlə Musaküçə */}
      {stats.length > 0 ? (
        <div className="mt-12 border-y border-stone-light bg-cream-deep">
          <Container className="py-10">
            <p className="mb-6 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
              Rəqəmlərlə Musaküçə
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-stone-light/70 bg-paper px-5 py-6">
                  <span className="text-terracotta">{stat.icon}</span>
                  <p className="mt-3 font-display text-[length:var(--text-h2)] leading-none text-forest">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{stat.label}</p>
                  <p className="text-xs text-ink-faint">{stat.note}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>
      ) : null}

      {/* C — Kənd haqqında */}
      <Container as="section" className="py-14 sm:py-18">
        <SectionHeading eyebrow="Musaküçə" title="Kənd haqqında" />
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink sm:text-2xl">{profile.shortDescription}</p>
        {hasLongText ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed whitespace-pre-line text-ink-soft">{profile.longDescription}</p>
        ) : null}
        {profile.mainOccupations ? (
          <p className="mt-6 max-w-2xl text-sm text-ink-soft">
            <span className="font-semibold text-ink">Əsas məşğuliyyət:</span> {profile.mainOccupations}
          </p>
        ) : null}
      </Container>

      {/* D — Coğrafiya */}
      {showGeography ? (
        <Container as="section" className="py-14 sm:py-18">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div>
              <SectionHeading eyebrow="Yerləşmə" title="Coğrafiya" />
              {profile.geographicalDescription ? (
                <p className="mt-4 max-w-xl text-base leading-relaxed whitespace-pre-line text-ink-soft">
                  {profile.geographicalDescription}
                </p>
              ) : null}
              {profile.neighboringSettlements ? (
                <p className="mt-4 max-w-xl text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Qonşu yaşayış məntəqələri:</span> {profile.neighboringSettlements}
                </p>
              ) : null}
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
              <VillagePhoto
                src={profile.heroImageUrl ?? "/images/village/hero-demo.jpg"}
                alt={heroAlt}
                tone="warm"
                placeholderLabel="Kənd mənzərəsi"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              {hasCoordinates ? (
                <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 rounded-lg bg-ink/70 px-3 py-2 text-xs text-cream backdrop-blur-sm">
                  <span className="font-mono tabular-nums">
                    {profile.latitude!.toFixed(4)}, {profile.longitude!.toFixed(4)}
                  </span>
                  <Link href="/xerite" className="font-semibold underline underline-offset-2 hover:text-cream/80">
                    Xəritədə bax
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      ) : null}

      {/* E — Adın mənşəyi */}
      {profile.nameOriginNarrative ? (
        <Container as="section" className="py-14 sm:py-18">
          <div className="mx-auto max-w-3xl rounded-2xl border border-stone-light bg-paper-soft p-8 sm:p-10">
            <SectionHeading eyebrow="Rəvayət" title="Adın mənşəyi" />
            <p className="mt-5 text-base leading-relaxed whitespace-pre-line text-ink-soft first-letter:mr-1 first-letter:float-left first-letter:font-display first-letter:text-[length:var(--text-h1)] first-letter:leading-[0.75] first-letter:text-forest">
              {profile.nameOriginNarrative}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {profile.nameOriginSourceStatus ? (
                <Badge tone="terracotta">{sourceStatusLabels[profile.nameOriginSourceStatus]}</Badge>
              ) : null}
              {profile.nameOriginSourceReference ? (
                <span className="text-xs text-ink-faint">{profile.nameOriginSourceReference}</span>
              ) : null}
            </div>
          </div>
        </Container>
      ) : null}

      {/* F — Tarix/yaddaş keçidi */}
      <Container as="section" className="pb-14 sm:pb-18">
        <div className="border-t border-stone-light pt-8">
          <p className="mb-5 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
            Davamını kəşf et
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {HISTORY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start justify-between gap-2 border-b border-transparent pb-1 hover:border-forest-light/60"
              >
                <span>
                  <span className="block font-display text-[length:var(--text-h4)] text-ink group-hover:text-forest">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{link.description}</span>
                </span>
                <span aria-hidden className="mt-1 text-forest transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* Yerli faydalı məlumatlar */}
      <Container as="section" className="pb-16 sm:pb-20">
        <div className="mb-4">
          <DataSourceNote isLive={localInfoIsLive} />
          <h2 className="font-display text-[length:var(--text-h3)] text-ink">Yerli faydalı məlumatlar</h2>
        </div>

        {localInfo.items.length === 0 ? (
          <EmptyState title="Hələ məlumat əlavə edilməyib" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {localInfo.items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-stone-light bg-paper p-4"
              >
                <span className="truncate text-sm font-medium text-ink" title={entry.name}>
                  {entry.name}
                </span>
                <Badge tone="neutral" className="shrink-0">
                  {localInfoKindLabels[entry.kind]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  );
}
