/**
 * PLACEHOLDER CONTENT — NOT PRODUCTION DATA.
 *
 * Every string in this file is representative sample copy written to lay
 * out the homepage during the design phase. None of it is verified
 * archive material, and none of it should ever be read as a factual
 * claim about a real village event, achievement, person or announcement.
 * Real content is entered through the admin CMS (from Phase 5/6 onward)
 * and replaces this file's role entirely — nothing here should reach a
 * production deployment un-replaced.
 *
 * Scope note: the homepage sections for listings, local info, events,
 * photos, people, history and voices are now served by the real API
 * (see `lib/api/*` + `withFallback`), so their mock fixtures were
 * removed. Only the "Bu gün kənddə" bulletin still falls back here.
 */

export type PhotoTone = "warm" | "forest" | "memorial";

/**
 * TEMPORARY VISUAL-DEMO PHOTOGRAPHY — not Musaküçə-specific.
 *
 * These are generic, openly-licensed rural/Caucasus-style stock photos
 * used only to evaluate the homepage's layout with real photography
 * instead of `PhotoPlaceholder` blocks. They do not depict Musaküçə.
 * Full source/license record: `public/images/village/DEMO_SOURCES.md`.
 */
const DEMO_IMG = {
  hero: "/images/village/hero-demo.jpg",
  oldPhotos: "/images/village/old-photos-demo.jpg",
} as const;

export type TodayUpdate = {
  title: string;
  description: string;
  category: string;
  /** "photo" items show a small thumbnail instead of the plain bullet
   * dot, so the list reads as mixed village-life content rather than a
   * uniform article list. */
  kind: "photo" | "text";
  tone?: PhotoTone;
  image?: string;
  /** ISO timestamp, when the underlying record actually has a
   * meaningful "recency" date (currently only Listings' `postedAt` —
   * see lib/relativeTime.ts). Renders as "2 saat əvvəl"/"Dünən"/etc.
   * when present; omitted entirely otherwise, never guessed. */
  date?: string;
};

export const todayUpdates: TodayUpdate[] = [
  {
    title: "Kənd yolu abadlaşdırılır",
    description:
      "Mərkəzi küçədə asfaltlama işləri davam edir, bu həftə sonuna qədər başa çatması gözlənilir.",
    category: "Abadlıq",
    kind: "photo",
    tone: "warm",
    image: DEMO_IMG.hero,
  },
  {
    title: "Məktəbdə respublika olimpiadası qalibi",
    description: "Riyaziyyat fənni üzrə şagirdimiz respublika mərhələsinə yollandı.",
    category: "Təhsil",
    kind: "text",
  },
  {
    title: "Bu gün arxivə 6 yeni foto əlavə olundu",
    description: "Sakinlərimizdən gələn köhnə ailə fotoları fotoarxivə qoşuldu.",
    category: "Yeni fotolar",
    kind: "photo",
    tone: "forest",
    image: DEMO_IMG.oldPhotos,
  },
  {
    title: "Kənd bulağının təmiri başa çatdı",
    description: "Köhnə bulaq təmizləndi və yeni su kəməri quraşdırıldı.",
    category: "Abadlıq",
    kind: "text",
  },
  {
    title: "Qış üçün əkin təqvimi paylaşıldı",
    description: "Aqronomumuzdan payızlıq əkin üzrə faydalı tövsiyələr.",
    category: "Faydalı məlumat",
    kind: "text",
  },
  {
    title: "Cümə axşamı kənd məclisi keçiriləcək",
    description: "Kənd sakinlərinin iştirakı ilə ümumi yığıncaq planlaşdırılıb.",
    category: "Elan",
    kind: "text",
  },
];
