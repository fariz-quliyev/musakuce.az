import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HistoryTimelineSection } from "@/components/history/HistoryTimelineSection";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { localInfoApi } from "@/lib/api/localInfo";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { localInfoKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { cn } from "@/lib/cn";
import type { LocalInfoEntryDto, PagedResult, PhotoDto } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Kəndimiz",
  description: "Musaküçə haqqında: coğrafiya, əhali və yerli faydalı məlumatlar.",
  path: "/kendimiz",
});

const LOCAL_INFO_FALLBACK: PagedResult<LocalInfoEntryDto> = {
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

// Deliberately empty rather than mock photos: a gallery is honest about
// "no photos yet" (adaptive layout) but must never present placeholder
// photography as if it were real Musaküçə imagery.
const PHOTOS_FALLBACK: PagedResult<PhotoDto> = { items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 0 };

/** Small line icons for the "Rəqəmlərlə Musaküçə" strip — inline so the
 * section doesn't need a new shared icon component for four glyphs. */
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

function DistrictIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 3v18M12 6h6l-1.5 2L18 10h-6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function RiverIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2M3 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2M3 20c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Musaküçə's administrative district and defining river — fixed
// geographic facts (already published elsewhere, e.g. Footer.tsx's
// "Musaküçə, Masallı" address and lib/weather.ts's location label), not
// part of the editable VillageProfile record, so kept as static
// constants here rather than invented as new backend fields.
const DISTRICT_NAME = "Masallı";
const RIVER_NAME = "Viləş";

const MEMORY_LINKS = [
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
  const [
    { data: localInfo, isLive: localInfoIsLive },
    { data: profile, isLive: profileIsLive },
    { data: photos },
  ] = await Promise.all([
    withFallback(() => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 20 }), LOCAL_INFO_FALLBACK),
    withFallback(() => villageProfileApi.get(), VILLAGE_PROFILE_FALLBACK),
    withFallback(() => photosApi.getPaged({ publicationStatus: "Published", pageSize: 5 }), PHOTOS_FALLBACK),
  ]);

  const heroAlt = profile.heroImageUrl ? profile.villageName : "Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)";

  // Gallery: prefer real, dedicated Photo records over the single
  // profile heroImageUrl — falls back to it (then to the temporary demo
  // image) only when the album has nothing published yet. Never repeats
  // a photo to pad the grid; the layout adapts to however many exist.
  const [bigPhoto, ...restPhotos] = photos.items;
  const smallPhotos = restPhotos.slice(0, 4);
  const bigPhotoSrc = bigPhoto?.imageUrl || profile.heroImageUrl || "/images/village/hero-demo.jpg";
  const bigPhotoAlt = bigPhoto ? bigPhoto.altText || bigPhoto.title : heroAlt;

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
  stats.push({ label: "Rayon", value: DISTRICT_NAME, note: "", icon: <DistrictIcon /> });
  stats.push({ label: "Çay", value: RIVER_NAME, note: "", icon: <RiverIcon /> });

  const hasLongText = Boolean(profile.longDescription && profile.longDescription !== profile.shortDescription);
  const showLocation = Boolean(profile.geographicalDescription || profile.neighboringSettlements);
  const hasCoordinates = profile.latitude != null && profile.longitude != null;
  const sourceReferenceIsLink = Boolean(profile.nameOriginSourceReference?.match(/^https?:\/\//));
  const hasNameOriginAside = Boolean(profile.nameOriginSourceStatus || profile.nameOriginSourceReference);

  return (
    <PageShell>
      <HistoryTimelineSection />

      {/* Kəndimiz — qısa giriş + əsas fotoalbom */}
      <Container as="section" className="pt-10 pb-8 sm:pt-14">
        {!profileIsLive ? <DataSourceNote isLive={profileIsLive} /> : null}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <div>
            <SectionHeading as="h1" eyebrow="Musaküçə haqqında" title={profile.villageName} description={profile.tagline ?? undefined} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:h-[320px] sm:grid-cols-4 sm:grid-rows-2 sm:gap-3">
            <div
              className={cn(
                "relative col-span-2 overflow-hidden rounded-2xl shadow-lg",
                smallPhotos.length > 0 ? "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-[16/10] sm:col-span-4 sm:row-span-2 sm:aspect-auto",
              )}
            >
              <VillagePhoto
                src={bigPhotoSrc}
                alt={bigPhotoAlt}
                tone="forest"
                variant={bigPhoto || profile.heroImageUrl ? "pattern" : "scene"}
                placeholderLabel="Musaküçə mənzərəsi əlavə olunacaq"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-full w-full"
              />
            </div>
            {smallPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl shadow-md sm:aspect-auto">
                <VillagePhoto
                  src={photo.imageUrl || undefined}
                  alt={photo.altText || photo.title}
                  tone="warm"
                  placeholderLabel={photo.title}
                  sizes="(min-width: 1024px) 15vw, 25vw"
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>
        <Link href="/fotoalbom" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest-dark">
          Bütün fotolara bax
          <span aria-hidden>→</span>
        </Link>
      </Container>

      {/* Rəqəmlərlə Musaküçə */}
      <div className="border-y border-stone-light bg-cream-deep">
        <Container className="py-8">
          <p className="mb-5 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
            Rəqəmlərlə Musaküçə
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-stone-light">
            {stats.map((stat, i) => (
              <div key={stat.label} className={cn("flex items-start gap-3 sm:px-6", i === 0 && "sm:pl-0")}>
                <span className="mt-0.5 text-terracotta">{stat.icon}</span>
                <div>
                  <p className="font-display text-[length:var(--text-h3)] leading-none text-forest">{stat.value}</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">{stat.label}</p>
                  {stat.note ? <p className="text-xs text-ink-faint">{stat.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Kənd haqqında */}
      <Container as="section" className="py-10 sm:py-14">
        <div className={cn("grid gap-8", profile.mainOccupations && "lg:grid-cols-[1fr_280px] lg:gap-12")}>
          <div>
            <SectionHeading eyebrow="Musaküçə" title="Kənd haqqında" />
            <p className="mt-4 max-w-2xl text-xl leading-relaxed text-ink sm:text-2xl">{profile.shortDescription}</p>
            {hasLongText ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed whitespace-pre-line text-ink-soft">{profile.longDescription}</p>
            ) : null}
          </div>
          {profile.mainOccupations ? (
            <div className="h-fit rounded-xl border border-stone-light bg-paper-soft p-5 lg:mt-14">
              <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">Əsas məşğuliyyət</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{profile.mainOccupations}</p>
            </div>
          ) : null}
        </div>
      </Container>

      {/* Kəndin yerləşməsi */}
      {showLocation ? (
        <Container as="section" className="py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div>
              <SectionHeading eyebrow="Yerləşmə" title="Kəndin yerləşməsi" />
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

      {/* Adın mənşəyi */}
      {profile.nameOriginNarrative ? (
        <Container as="section" className="py-10 sm:py-14">
          <div className="rounded-2xl border border-stone-light bg-paper-soft p-6 sm:p-10">
            <div className={cn("grid gap-8", hasNameOriginAside && "lg:grid-cols-[1fr_220px]")}>
              <div>
                <SectionHeading eyebrow="Rəvayət" title="Adın mənşəyi" />
                <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-ink-soft first-letter:mr-1 first-letter:float-left first-letter:font-display first-letter:text-[length:var(--text-h1)] first-letter:leading-[0.75] first-letter:text-forest">
                  {profile.nameOriginNarrative}
                </p>
              </div>
              {hasNameOriginAside ? (
                <div className="flex flex-col gap-3 lg:border-l lg:border-stone-light lg:pl-8">
                  {profile.nameOriginSourceStatus ? (
                    <Badge tone="terracotta" className="w-fit">
                      {sourceStatusLabels[profile.nameOriginSourceStatus]}
                    </Badge>
                  ) : null}
                  {profile.nameOriginSourceReference ? (
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">Mənbə</p>
                      {sourceReferenceIsLink ? (
                        <a
                          href={profile.nameOriginSourceReference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-sm break-all text-forest underline underline-offset-2 hover:text-forest-dark"
                        >
                          {profile.nameOriginSourceReference}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-ink-soft">{profile.nameOriginSourceReference}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      ) : null}

      {/* Kəndin yaddaşı */}
      <Container as="section" className="pb-10 sm:pb-14">
        <div className="border-t border-stone-light pt-6">
          <p className="mb-5 text-[length:var(--text-eyebrow)] leading-[var(--text-eyebrow--line-height)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
            Kəndin yaddaşı
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {MEMORY_LINKS.map((link) => (
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
