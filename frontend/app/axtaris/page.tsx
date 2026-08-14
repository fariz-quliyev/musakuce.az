import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SearchPageClient } from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "Axtarış — Musaküçə",
  description: "Musaküçə haqqında insanlar, tarix və fotolar üzrə axtarış.",
};

export default function AxtarisPage() {
  return (
    <PageShell>
      <SearchPageClient />
    </PageShell>
  );
}
