import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/home/Hero";
import { VillageIntro } from "@/components/home/VillageIntro";
import { VillageFacts } from "@/components/home/VillageFacts";
import { VillageTodayStrip } from "@/components/home/VillageTodayStrip";
import { TodayInVillage } from "@/components/home/TodayInVillage";
import { VillageSquare } from "@/components/home/VillageSquare";
import { ThisWeek } from "@/components/home/ThisWeek";
import { TodayPhotos } from "@/components/home/TodayPhotos";
import { OurPeople } from "@/components/home/OurPeople";
import { OurHistory } from "@/components/home/OurHistory";
import { VillageVoices } from "@/components/home/VillageVoices";
import { MapPreview } from "@/components/home/MapPreview";
import { MemorialMinimal } from "@/components/home/MemorialMinimal";
import { ContributeCta } from "@/components/home/ContributeCta";
import { Footer } from "@/components/home/Footer";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

// Not buildPageMetadata() — that helper always suffixes " — Musaküçə",
// but the homepage intentionally leads with the brand name itself
// ("Musaküçə — bizim kənd"), so canonical/OG/twitter are set directly
// here instead, same shape as buildPageMetadata otherwise produces.
const homeTitle = "Musaküçə — bizim kənd";
const homeDescription =
  "Musaküçə kəndinin rəqəmsal yaddaşı və gündəlik həyatı: tarix, insanlar, xatirələr, foto-video arxiv, elanlar və kənd icması bir yerdə.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    type: "website",
    locale: "az_AZ",
    siteName: "Musaküçə",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

/**
 * Homepage — combines the Digital Memory pillar (history, people,
 * photos, voices, memorial) with the Digital Village Square pillar
 * (today's life, the village square board, this week's events) per
 * docs/MUSAKUCE_SPEC.md §5. Every photo is a `PhotoPlaceholder` pending
 * real Musaküçə photography; all list content is placeholder data from
 * lib/mock-content.ts pending the admin CMS (Phase 5+).
 */
export default async function Home() {
  const { data: profile } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  return (
    <>
      <Navbar logoImageUrl={profile.logoImageUrl} />
      <main className="flex-1">
        <Hero />
        <VillageIntro />
        <VillageFacts />
        <VillageTodayStrip />
        <TodayInVillage />
        <VillageSquare />
        <ThisWeek />
        <TodayPhotos />
        <OurPeople />
        <OurHistory />
        <VillageVoices />
        <MapPreview />
        <MemorialMinimal />
        <ContributeCta />
      </main>
      <Footer />
    </>
  );
}
