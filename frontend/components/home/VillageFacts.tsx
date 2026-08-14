import { Container } from "@/components/ui/Container";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { withFallback } from "@/lib/api/withFallback";
import { VILLAGE_PROFILE_FALLBACK } from "@/lib/villageProfileFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";

/**
 * "Village facts", not a corporate dashboard: large display numbers on a
 * warm strip, each with a plain-language note. Sourced entirely from the
 * admin-managed VillageProfile (Phase 12 §2) — a stat only appears once
 * an admin has actually entered it, rather than a fixed set of
 * hardcoded figures. Fetches the same /api/village-profile VillageIntro
 * does — Next.js's request-level fetch memoization collapses the two
 * into a single network call per render, so this isn't a duplicate
 * request in practice despite being two independent components.
 */
export async function VillageFacts() {
  const { data: profile } = await withFallback(
    () => villageProfileApi.get(undefined, HOMEPAGE_REVALIDATE_SECONDS),
    VILLAGE_PROFILE_FALLBACK,
  );

  const facts: { label: string; value: string; note: string }[] = [];
  if (profile.population) {
    facts.push({
      label: "Əhali",
      value: profile.population.toLocaleString("az-AZ"),
      note: profile.populationAsOfYear ? `nəfər, ${profile.populationAsOfYear}` : "nəfər",
    });
  }
  if (profile.areaHectares) {
    facts.push({ label: "Ərazi", value: profile.areaHectares.toLocaleString("az-AZ"), note: "hektar" });
  }
  if (facts.length === 0) return null;

  return (
    <div className="border-y border-stone-light bg-cream-deep">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-12 sm:grid-cols-5 sm:gap-x-4">
        {facts.map((fact) => (
          <div key={fact.label} className="text-center sm:text-left">
            <p className="font-display text-[length:var(--text-h1)] leading-none text-forest">{fact.value}</p>
            <p className="mt-2 text-sm font-semibold text-ink">{fact.label}</p>
            {fact.note ? <p className="text-xs text-ink-faint">{fact.note}</p> : null}
          </div>
        ))}
      </Container>
    </div>
  );
}
