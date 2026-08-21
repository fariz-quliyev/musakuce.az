import type { Metadata } from "next";
import { fraunces, plusJakartaSans } from "@/lib/fonts";
import { websiteJsonLd, jsonLdScript } from "@/lib/structuredData";
import "./globals.css";

// Enables relative canonical/OG URLs on individual pages (Phase 13 §13)
// to resolve to a real absolute URL — musakuce.az is this project's own
// domain per its name and Footer branding, not a guessed third party.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Musaküçə — bizim kənd",
  description:
    "Musaküçə kəndinin rəqəmsal yaddaşı və gündəlik həyatı: tarix, insanlar, xatirələr, foto-video arxiv və kənd icması bir yerdə.",
};

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
