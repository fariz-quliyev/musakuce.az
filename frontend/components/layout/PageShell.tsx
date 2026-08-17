import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/home/Footer";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/** Shared Navbar + Footer wrapper for every non-homepage route page. */
export async function PageShell({ children }: { children: React.ReactNode }) {
  const { data: profile } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  return (
    <>
      <Navbar logoImageUrl={profile.logoImageUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
