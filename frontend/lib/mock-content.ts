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
  harvestField: "/images/village/harvest-field-demo.jpg",
  mistyRiver: "/images/village/misty-river-demo.jpg",
  historicArchway: "/images/village/historic-archway-demo.jpg",
  childrenRural: "/images/village/children-rural-demo.jpg",
  oldPhotos: "/images/village/old-photos-demo.jpg",
  elderWoman: "/images/village/elder-woman-demo.jpg",
  elderMan: "/images/village/elder-man-demo.jpg",
  elderMan2: "/images/village/elder-man-2-demo.jpg",
  cowPasture: "/images/village/cow-pasture-demo.jpg",
} as const;

export const villageFacts = [
  { label: "Əhali", value: "3 922", note: "nəfər", oral: false },
  { label: "Ərazi", value: "905,23", note: "hektar", oral: false },
  { label: "Tarixi", value: "800+", note: "il", oral: true },
  { label: "Məscid", value: "1903", note: "inşa ili", oral: false },
  { label: "İlk məktəb", value: "1928", note: "təsis ili", oral: false },
] as const;

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

export const squareListings = [
  {
    title: "Süd inəyi satılır",
    category: "Mal-qara",
    price: "1 200 ₼",
    location: "Musaküçə",
    image: DEMO_IMG.cowPasture as string | undefined,
  },
  {
    title: "Kombayn xidməti göstərilir",
    category: "Xidmət",
    price: null,
    location: "Musaküçə və ətrafı",
    image: DEMO_IMG.harvestField as string | undefined,
  },
  {
    title: "Açar dəstəsi tapılıb",
    category: "İtirilmiş-tapılmış",
    price: null,
    location: "Məscid yaxınlığı",
    // No suitable generic demo photo for a lost-and-found listing —
    // intentionally left undefined so it falls back to PhotoPlaceholder.
    image: undefined as string | undefined,
  },
];

export const squareLocalInfo = [
  { name: "Vaqif — Elektrik ustası", category: "Xidmət" },
  { name: "Mərkəz aptek", category: "Faydalı əlaqə" },
  { name: "Aygün — Tikiş ustası", category: "Xidmət" },
];

export const weekEvents = [
  { day: "Şən", date: "16", title: "Kənd məclisi", place: "Mədəniyyət evi" },
  { day: "Baz", date: "17", title: "Uşaqlar üçün idman yarışı", place: "Məktəb həyəti" },
  { day: "B.e", date: "18", title: "Toy mərasimi", place: "Kənd meydanı" },
  { day: "Ç.a", date: "19", title: "Valideyn iclası", place: "Məktəb" },
  { day: "Çər", date: "20", title: "Əkinçilik seminari", place: "Kənd meydanı" },
];

export const featuredStory = {
  title: "1962 — məktəbin ilk məzunları",
  excerpt:
    "Bu şəkil yeni məktəb binasının açılışından bir il sonra, ilk məzun buraxılışı zamanı çəkilib. Şəkildəki müəllim və şagirdlərin bir çoxu bu gün də kənddə yaşayır.",
  date: "1962",
  source: "Ailə arxivi",
  image: DEMO_IMG.oldPhotos as string | undefined,
};

export const todayPhotos = [
  {
    caption: "Səhər çənli Viləş çayı",
    tone: "forest" as PhotoTone,
    aspect: "portrait" as const,
    image: DEMO_IMG.mistyRiver as string | undefined,
  },
  {
    caption: "Məscid həyətində",
    tone: "warm" as PhotoTone,
    aspect: "square" as const,
    image: DEMO_IMG.historicArchway as string | undefined,
  },
  {
    caption: "Payız biçini",
    tone: "warm" as PhotoTone,
    aspect: "landscape" as const,
    image: DEMO_IMG.harvestField as string | undefined,
  },
  {
    caption: "Kənd yolu",
    tone: "forest" as PhotoTone,
    aspect: "square" as const,
    image: DEMO_IMG.cowPasture as string | undefined,
  },
  {
    caption: "Uşaqlar məktəb həyətində",
    tone: "warm" as PhotoTone,
    aspect: "portrait" as const,
    image: DEMO_IMG.childrenRural as string | undefined,
  },
];

export const featuredPeople = [
  {
    name: "Zeynəb müəllimə",
    role: "Müəllim",
    category: "Təhsil",
    image: DEMO_IMG.elderWoman as string | undefined,
  },
  {
    name: "Kərim baba",
    role: "Əmək veterani",
    category: "Kənd təsərrüfatı",
    image: DEMO_IMG.elderMan as string | undefined,
  },
  {
    name: "Aqşin",
    role: "İdmançı",
    category: "İdman",
    // No suitable generic demo photo found — left as PhotoPlaceholder.
    image: undefined as string | undefined,
  },
  {
    name: "Səlimə nənə",
    role: "Toxucu, həsirçi",
    category: "Mədəni irs",
    image: DEMO_IMG.elderWoman as string | undefined,
  },
];

export const historyTimeline = [
  { year: "1200–1210", label: "İlk məskunlaşma rəvayəti", oral: true },
  { year: "1902", label: "Məscidin tikintisinə başlanır", oral: false },
  { year: "1903", label: "Məscid tikilib başa çatır", oral: false },
  { year: "1928", label: "İlk məktəb açılır", oral: false },
  { year: "1936", label: "Yeddiillik məktəb", oral: false },
  { year: "1962", label: "Yeni məktəb binası", oral: false },
  { year: "1970", label: "Orta təhsilə keçid", oral: false },
];

export const villageVoices = [
  {
    name: "Səlimə nənə",
    topic: "Kənd toyları haqqında xatirələr",
    kind: "Audio",
    image: DEMO_IMG.elderWoman as string | undefined,
  },
  {
    name: "Kərim baba",
    topic: "Sovxoz dövrü",
    kind: "Video",
    image: DEMO_IMG.elderMan as string | undefined,
  },
  {
    name: "Hüseyn kişi",
    topic: "Həsirçilik sənəti",
    kind: "Audio",
    image: DEMO_IMG.elderMan2 as string | undefined,
  },
];
