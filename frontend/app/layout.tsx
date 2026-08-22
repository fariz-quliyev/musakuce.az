import type { Metadata } from "next";
import { fraunces, plusJakartaSans } from "@/lib/fonts";
import { websiteJsonLd, jsonLdScript } from "@/lib/structuredData";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import "./globals.css";

// Enables relative canonical/OG URLs on individual pages (Phase 13 §13)
// to resolve to a real absolute URL — musakuce.az is this project's own
// domain per its name and Footer branding, not a guessed third party.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

const title = "Musaküçə — bizim kənd";
const description =
  "Musaküçə kəndinin rəqəmsal yaddaşı və gündəlik həyatı: tarix, insanlar, xatirələr, foto-video arxiv və kənd icması bir yerdə.";

/**
 * SEO audit item #10 — every page with its own content photo already
 * sets its own openGraph/twitter image via buildPageMetadata(); a page
 * with none (most list pages, a text-only detail entry) previously fell
 * through to no social-share image at all. This site-wide default
 * (inherited by every route that doesn't override openGraph.images)
 * uses the real admin-managed Hero photo — falling back to the Logo,
 * never a fabricated or generic stock image — so a village with
 * neither uploaded yet still correctly shows no image, rather than a
 * misleading placeholder.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data: profile } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );
  const defaultImage = profile.heroImageUrl ?? profile.logoImageUrl ?? undefined;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      type: "website",
      locale: "az_AZ",
      siteName: "Musaküçə",
      images: defaultImage ? [{ url: defaultImage }] : undefined,
    },
    twitter: {
      card: defaultImage ? "summary_large_image" : "summary",
      images: defaultImage ? [defaultImage] : undefined,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      className={`${fraunces.variable} ${plusJakartaSans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
