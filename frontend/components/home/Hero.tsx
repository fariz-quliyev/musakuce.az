import { Suspense } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HeroWeather } from "@/components/home/HeroWeather";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * Full-bleed hero. Image, heading and subtitle are admin-managed via the
 * "Kəndimiz" profile (heroImageUrl / villageName / shortDescription) —
 * falls back to the TEMPORARY VISUAL-DEMO photo (see
 * public/images/village/DEMO_SOURCES.md) and today's copy only while no
 * profile has been published yet, same fallback convention as
 * VillageIntro.
 *
 * Pared back to name + one line on request: the eyebrow, the second
 * paragraph and both CTA buttons were removed. NOTE for whoever touches
 * the admin panel next — VillageProfile still exposes ctaText/ctaLink
 * ("Baş səhifə düyməsinin mətni/keçidi" in VillageProfileForm), but this
 * was their only render site, so anything entered there now goes
 * nowhere. Either drop those two fields from the form/DTO or bring a
 * button back; don't leave the admin filling in a dead input.
 *
 * Composition: full-bleed background image with a bottom-weighted
 * gradient so the wordmark stays legible over any photo.
 *
 * Height is a 60vh *minimum* at sm+, not a fixed size — matching the
 * reference the client asked for (sosial.gov.az's banner measures 430px
 * of a 720px viewport, i.e. 60%, against the 76/80vh this used to
 * reserve, which swallowed the whole first screen). Mobile keeps 76vh;
 * because it is `min-h` on a flex container, a viewport that needs more
 * room still grows past it instead of clipping.
 *
 * Visual priority, deliberately in this order (also the DOM/reading
 * order — the weather widget is positioned in a top corner visually but
 * placed last in markup so it doesn't out-rank the village name for
 * assistive tech either): 1) village name, 2) short intro, 3) weather —
 * a useful secondary element, not the hero's focal point.
 */
export async function Hero() {
  const { data: profile, isLive } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  return (
    <section className="relative flex min-h-[76vh] w-full items-end overflow-hidden sm:min-h-[60vh]">
      <div className="absolute inset-0">
        <VillagePhoto
          src={profile.heroImageUrl ?? "/images/village/hero-demo.jpg"}
          alt={profile.heroImageUrl ? "Musaküçə" : "Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)"}
          tone="forest"
          variant="scene"
          placeholderLabel="Musaküçə panoramı əlavə olunacaq"
          className="h-full w-full"
          // Focal point tuned separately per breakpoint: on narrow/tall
          // mobile crops the default centered cover pushes the scene's
          // horizon too high, so the mobile focal point sits lower
          // (more ground, less sky); desktop's wider crop reads fine
          // closer to center. Swap these two values once real Musaküçə
          // photography replaces the temporary demo image above.
          imageClassName="object-[center_68%] sm:object-[center_52%]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-terracotta-dark/10" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <DataSourceNote isLive={isLive} />
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-cream text-balance uppercase">
          {profile.villageName}
        </h1>
        <p className="mt-4 max-w-xl text-xl leading-snug text-cream/95">{profile.shortDescription}</p>
      </div>

      {/* Corner differs by breakpoint, for measured reasons:
        * - sm+ : top-*right*. The copy column is capped at max-w-xl and
        *   sits bottom-left, so once the hero shrank to 60vh the card's
        *   old top-left slot ran straight through the eyebrow and h1;
        *   on the right it clears the nearest glyph by ~414px.
        * - mobile: stays top-*left*. The card is ~206px wide, wider than
        *   half a 375px screen, so no corner can dodge a full-width copy
        *   block horizontally — separation there comes from the taller
        *   76vh hero pushing the copy below the card instead. */}
      <div className="absolute top-4 left-4 z-10 sm:top-8 sm:left-auto sm:right-8">
        <Suspense fallback={null}>
          <HeroWeather />
        </Suspense>
      </div>
    </section>
  );
}
