import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { interviewsApi } from "@/lib/api/interviews";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { InterviewDto } from "@/lib/api/types";

const FALLBACK_INTERVIEWS: InterviewDto[] = [];

/** "Kəndimizin səsi" — oral history / interview teaser, audio-cover
 * style cards with a play affordance rather than plain text list. */
export async function VillageVoices() {
  const { data: interviews } = await withFallback(
    () => interviewsApi.getPaged({ publicationStatus: "Published", pageSize: 3 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_INTERVIEWS,
  );

  if (interviews.length === 0) return null;

  return (
    <Container as="section" className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Şifahi tarix"
        title="Kəndimizin səsi"
        description="Yaşlı sakinlərimizin xatirələri, danışdıqları hekayələr və ənənələr."
        className="mb-10"
      />

      <div className="grid gap-5 sm:grid-cols-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="group relative overflow-hidden rounded-lg">
            <div className="aspect-square">
              <VillagePhoto
                src={interview.thumbnailImageUrl ?? undefined}
                alt={interview.personName}
                tone="forest"
                placeholderLabel={interview.personName}
                sizes="(min-width: 640px) 33vw, 100vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-md transition-transform group-hover:scale-105"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="ml-0.5 h-5 w-5 text-forest">
                <path d="M6 4.5v11l9-5.5-9-5.5Z" />
              </svg>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <Badge tone="gold" className="mb-2">
                Müsahibə
              </Badge>
              <p className="font-display text-base text-cream">{interview.personName}</p>
              {interview.title ? <p className="text-xs text-cream/80">{interview.title}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
