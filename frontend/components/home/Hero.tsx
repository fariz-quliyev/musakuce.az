import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HeroWeather } from "@/components/home/HeroWeather";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * Full-bleed hero. Image, main heading, subtitle, and the primary CTA
 * button are admin-managed via the "Kəndimiz" profile (heroImageUrl /
 * villageName / shortDescription / ctaText+ctaLink) — falls back to the
 * TEMPORARY VISUAL-DEMO photo (see public/images/village/DEMO_SOURCES.md)
 * and today's copy/CTA only while no profile has been published yet,
 * same fallback convention as VillageIntro. The eyebrow line, second
 * paragraph, and secondary button are not part of the managed fields —
 * left as-is.
 *
 * Composition: wide/tall background image with a bottom-weighted
 * gradient so the wordmark and buttons stay legible over any photo.
 *
 * Visual priority, deliberately in this order (also the DOM/reading
 * order — the weather widget is positioned top-left visually but placed
 * last in markup so it doesn't out-rank the village name for assistive
 * tech either): 1) village name, 2) short intro, 3) primary CTAs,
 * 4) weather — a useful secondary element, not the hero's focal point.
 */
export async function Hero() {
  const { data: profile, isLive } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  return (
    <section className="relative flex min-h-[76vh] w-full items-end overflow-hidden sm:min-h-[80vh]">
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
        <p className="mb-4 text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-cream/80">
          Musaküçə — bizim kənd
        </p>
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-cream text-balance uppercase">
          {profile.villageName}
        </h1>
        <p className="mt-4 max-w-xl text-xl leading-snug text-cream/95">{profile.shortDescription}</p>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-cream/75">
          Musaküçə haqqında tarix, insanlar, xatirələr və bu gün kənddə baş
          verənlər — bir yerdə.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={profile.ctaLink ?? "#kendimiz"} variant="secondary" size="lg">
            {profile.ctaText ?? "Kəndimizi tanı"}
          </Button>
          <Button
            href="#bu-gun-kendde"
            variant="outline"
            size="lg"
            className="border-cream/50 text-cream hover:bg-cream/10"
          >
            Bu gün kənddə
          </Button>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10 sm:top-8 sm:left-8">
        <Suspense fallback={null}>
          <HeroWeather />
        </Suspense>
      </div>
    </section>
  );
}
