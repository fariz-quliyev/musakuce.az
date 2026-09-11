import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { HomeSection } from "@/components/home/HomeSection";
import { HomeLinkCard, linkCardIconProps as icon } from "@/components/home/HomeLinkCard";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

const DIRECTIONS = [
  {
    title: "Kəndimiz",
    href: "/kendimiz",
    description: "Coğrafiyası, təbiəti, əhalisi və gündəlik həyatı ilə Musaküçə.",
    icon: (
      <svg {...icon}>
        <path d="M4 11 12 4l8 7" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    ),
  },
  {
    title: "İnsanlarımız",
    href: "/insanlarimiz",
    description: "Kəndimizin tanınmış, yadda qalan və sevilən sakinləri.",
    icon: (
      <svg {...icon}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
        <circle cx="17" cy="9" r="2.3" />
        <path d="M15.5 14.8c2.8-.4 5 1.6 5 5.2" />
      </svg>
    ),
  },
  {
    title: "Tariximiz",
    href: "/tariximiz",
    description: "İlk məskunlaşmadan bu günə — kəndin keçdiyi yol.",
    icon: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
  {
    title: "Təhsil",
    href: "/tehsil",
    description: "Məktəbimiz, müəllimlərimiz və məzunlarımızın uğurları.",
    icon: (
      <svg {...icon}>
        <path d="M12 5 3 9l9 4 9-4-9-4Z" />
        <path d="M7 11.2V16c0 1.1 2.2 2 5 2s5-.9 5-2v-4.8" />
      </svg>
    ),
  },
];

/**
 * "Musaküçə haqqında" — the homepage's version of Riseley's "Village
 * Information" row: four signposts into the inner pages, no long copy.
 * The only prose is the admin's one-line VillageProfile.shortDescription,
 * shown when set. Keeps the `kendimiz` anchor so any existing
 * `/#kendimiz` link still lands here.
 */
export async function AboutVillage() {
  const { data: profile, isLive } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  return (
    <HomeSection
      id="kendimiz"
      band="muted"
      title="Musaküçə haqqında"
      description={profile.shortDescription?.trim() || undefined}
    >
      <DataSourceNote isLive={isLive} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DIRECTIONS.map(({ title, href, description, icon: glyph }) => (
          <HomeLinkCard key={href} href={href} icon={glyph} title={title} description={description} />
        ))}
      </div>
    </HomeSection>
  );
}
