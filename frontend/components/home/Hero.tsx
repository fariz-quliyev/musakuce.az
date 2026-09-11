import { Suspense } from "react";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Button } from "@/components/ui/Button";
import { HeroWeather } from "@/components/home/HeroWeather";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * Welcome hero, after Riseley's "Welcome to Riseley": one village photo,
 * a greeting, one line, one button. Deliberately bounded in height (a
 * fixed min-height per breakpoint rather than a share of the viewport)
 * so the first screen also shows the start of "Son xəbərlər" instead of
 * being all hero.
 *
 * The photo is admin-managed (VillageProfile.heroImageUrl). The button
 * reads VillageProfile.ctaText / ctaLink ("Baş səhifə düyməsinin
 * mətni/keçidi" in the admin form) and falls back to "Kəndimizi tanı" →
 * /kendimiz when those are empty. The greeting and subtitle are fixed
 * copy: the greeting inflects the village name ("Musaküçəyə"), which a
 * free-text admin field can't do.
 *
 * The weather card sits top-right at sm+ and top-left on mobile, placed
 * last in the markup so it never out-ranks the greeting for assistive
 * tech.
 */
export async function Hero() {
  const { data: profile, isLive } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );
  const ctaText = profile.ctaText?.trim() || "Kəndimizi tanı";
  const ctaLink = profile.ctaLink?.trim() || "/kendimiz";

  return (
    <section className="relative flex min-h-[27rem] w-full items-end overflow-hidden sm:min-h-[30rem] lg:min-h-[34rem]">
      <div className="absolute inset-0">
        <VillagePhoto
          src={profile.heroImageUrl ?? "/images/village/hero-demo.jpg"}
          alt={profile.heroImageUrl ? "Musaküçə" : "Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)"}
          tone="forest"
          variant="scene"
          placeholderLabel="Musaküçə panoramı əlavə olunacaq"
          className="h-full w-full"
          // Separate focal points: narrow mobile crops need more ground
          // and less sky than the wide desktop crop.
          imageClassName="object-[center_68%] sm:object-[center_52%]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <DataSourceNote isLive={isLive} />
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] font-semibold text-text-on-primary text-balance">
          Musaküçəyə xoş gəlmisiniz
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-snug text-text-on-primary sm:text-xl">
          Kəndimizin dünəni, bu günü və insanları.
        </p>
        <Button href={ctaLink} className="mt-7">
          {ctaText} <span aria-hidden>→</span>
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-10 sm:top-8 sm:left-auto sm:right-8">
        <Suspense fallback={null}>
          <HeroWeather />
        </Suspense>
      </div>
    </section>
  );
}
