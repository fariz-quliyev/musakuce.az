import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { AboutVillage } from "@/components/home/AboutVillage";
import { VillageSquare } from "@/components/home/VillageSquare";
import { PhotoGallery } from "@/components/home/PhotoGallery";
import { OurPeople } from "@/components/home/OurPeople";
import { OurHistory } from "@/components/home/OurHistory";
import { MapPreview } from "@/components/home/MapPreview";
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
 * Homepage — a doorway, not an archive (after riseleyparishcouncil.gov.uk):
 * each section shows a small taste and hands off to its inner page.
 * Order: welcome → news → about → village life → photos → people →
 * history → map → contribute. Detail lives on the inner pages.
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
        <LatestNews />
        <AboutVillage />
        <VillageSquare />
        <PhotoGallery />
        <OurPeople />
        <OurHistory />
        <MapPreview />
        <ContributeCta />
      </main>
      <Footer />
    </>
  );
}
