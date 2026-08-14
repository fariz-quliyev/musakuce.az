import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HeroWeather } from "@/components/home/HeroWeather";

/**
 * Full-bleed hero — currently a TEMPORARY VISUAL-DEMO photo (generic
 * royalty-free rural landscape, not Musaküçə — see
 * public/images/village/DEMO_SOURCES.md). Real Musaküçə panorama
 * photography replaces `src` below once available; the `PhotoPlaceholder`
 * fallback (via `VillagePhoto`) still applies if `src` is removed.
 * Composition: wide/tall background image with a bottom-weighted
 * gradient so the wordmark and buttons stay legible over any photo.
 *
 * Visual priority, deliberately in this order (also the DOM/reading
 * order — the weather widget is positioned top-left visually but placed
 * last in markup so it doesn't out-rank the village name for assistive
 * tech either): 1) village name, 2) short intro, 3) primary CTAs,
 * 4) weather — a useful secondary element, not the hero's focal point.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[76vh] w-full items-end overflow-hidden sm:min-h-[80vh]">
      <div className="absolute inset-0">
        <VillagePhoto
          src="/images/village/hero-demo.jpg"
          alt="Kənd mənzərəsi (müvəqqəti demo foto — Musaküçəyə aid deyil)"
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
        <p className="mb-4 text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-cream/80">
          Musaküçə — bizim kənd
        </p>
        <h1 className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-cream text-balance">
          MUSAKÜÇƏ
        </h1>
        <p className="mt-4 max-w-xl text-xl leading-snug text-cream/95">
          Kəndimizin yaddaşı, insanları və həyatı.
        </p>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-cream/75">
          Musaküçə haqqında tarix, insanlar, xatirələr və bu gün kənddə baş
          verənlər — bir yerdə.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#kendimiz" variant="secondary" size="lg">
            Kəndimizi tanı
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
