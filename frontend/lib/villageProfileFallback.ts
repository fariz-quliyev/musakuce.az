import type { VillageProfileDto } from "@/lib/api/types";

/**
 * Shared development fallback for every homepage section that reads
 * VillageProfile — used only while the API is unreachable or no profile
 * has been published yet (see lib/api/withFallback.ts). Real content
 * always comes from /admin/kendimiz once published.
 */
export const VILLAGE_PROFILE_FALLBACK: VillageProfileDto = {
  id: "mock",
  villageName: "Musaküçə",
  tagline: "Musaküçə — bizim kənd",
  shortDescription:
    "Talış dağlarının ətəyində, Viləş çayının qırağında yerləşən Musaküçə — heyvandarlıq, əkinçilik və qismən " +
    "həsirçiliklə məşğul olan sakinləri olan bir kənddir.",
  longDescription:
    "Talış dağlarının ətəyində, Viləş çayının qırağında yerləşən Musaküçə — heyvandarlıq, əkinçilik və qismən " +
    "həsirçiliklə məşğul olan sakinləri olan bir kənddir. Bu sayt onun tarixini, insanlarını və bu günkü həyatını " +
    "bir yerdə saxlamaq üçün yaradılıb.",
  population: 3922,
  populationAsOfYear: null,
  areaHectares: 905.23,
  geographicalDescription: null,
  mainOccupations: "Heyvandarlıq, əkinçilik, həsirçilik",
  neighboringSettlements: null,
  nameOriginNarrative: null,
  nameOriginSourceStatus: null,
  nameOriginSourceReference: null,
  latitude: 39.00861,
  longitude: 48.69889,
  heroMediaAssetId: null,
  heroImageUrl: null,
  ctaText: "Kəndimizi tanı",
  ctaLink: "#kendimiz",
  logoMediaAssetId: null,
  logoImageUrl: null,
  contactInfo: null,
  socialLinks: null,
  editorialNote: null,
  publicationStatus: "Published",
  updatedAt: "2026-01-01T00:00:00Z",
};
