import { Container } from "@/components/ui/Container";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * Compact editorial transition between the hero and the facts strip —
 * intentionally brief (a heading + two short sentences), not a full
 * "about" section, so the page doesn't stall with empty space before
 * reaching the village statistics. Reads its text from the admin-managed
 * VillageProfile (Phase 12 §2); falls back to placeholder copy only
 * while no profile has been published yet.
 */
export async function VillageIntro() {
  const { data: profile, isLive } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );
  const text = profile.longDescription ?? profile.shortDescription;

  return (
    <Container as="section" id="kendimiz" className="py-10 sm:py-14">
      <DataSourceNote isLive={isLive} />
      <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div>
          <h2 className="font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-forest">
            Musaküçə haqqında
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{text}</p>
        </div>

        <div className="hidden aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-lg shadow-md sm:block md:w-44">
          <VillagePhoto
            src="/images/village/hero-demo.jpg"
            alt="Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)"
            tone="warm"
            placeholderLabel="Kənd mənzərəsi"
            sizes="(min-width: 768px) 11rem, 9rem"
          />
        </div>
      </div>
    </Container>
  );
}
