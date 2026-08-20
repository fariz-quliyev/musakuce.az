import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ModerationStatusBadge } from "@/components/admin/StatusBadge";
import { CorrectionModerationActions } from "@/components/admin/corrections/CorrectionModerationActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { correctionsApi } from "@/lib/api/corrections";
import { targetEntityTypeLabels } from "@/lib/api/labels";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { TargetEntityType } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Düzəliş təklifi — Admin — Musaküçə" };

/** Where to jump to edit the target record directly — the reviewer
 * applies an approved suggestion manually via that content type's own
 * existing admin form (see CorrectionModerationActions' hint). */
const EDIT_PATH: Record<TargetEntityType, string> = {
  Person: "/admin/insanlar",
  HistoricalEvent: "/admin/tarix",
  EducationEntry: "/admin/tehsil",
  MemorialRecord: "/admin/xatire",
  CulturalHeritageItem: "/admin/medeni-iras",
  Interview: "/admin/kendimizin-sesi",
  Place: "/admin/yerler",
  LocalInfoEntry: "/admin/faydali-melumatlar",
  Photo: "/admin/fotoalbom",
  Video: "/admin/videolar",
};

export default async function AdminCorrectionDetailPage({ params }: Props) {
  const { id } = await params;

  let suggestion;
  try {
    suggestion = await correctionsApi.getById(id);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu təklifə baxmaq üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Təklifi yükləmək mümkün olmadı" />;
  }

  const typeLabel = targetEntityTypeLabels[suggestion.targetEntityType];

  return (
    <div>
      <AdminPageHeader
        title={suggestion.targetTitle}
        description={new Date(suggestion.createdAt).toLocaleDateString("az-AZ", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        breadcrumb={[{ label: "Düzəliş təklifləri", href: "/admin/duzelis-teklifleri" }, { label: suggestion.targetTitle }]}
        actions={<ModerationStatusBadge status={suggestion.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-stone-light bg-paper p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-paper-soft px-2.5 py-1 font-semibold text-ink-soft">{typeLabel}</span>
              <Link href={`${EDIT_PATH[suggestion.targetEntityType]}`} className="font-medium text-forest hover:underline">
                Əsas qeydə keç →
              </Link>
            </div>

            <dl className="mt-4 grid gap-4 text-sm">
              {suggestion.fieldOrSection ? (
                <div>
                  <dt className="text-ink-faint">Hansı hissəyə aiddir</dt>
                  <dd className="mt-0.5 font-medium text-ink">{suggestion.fieldOrSection}</dd>
                </div>
              ) : null}
              {suggestion.suggestedChange ? (
                <div>
                  <dt className="text-ink-faint">Təklif olunan düzəliş/əlavə</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-ink">{suggestion.suggestedChange}</dd>
                </div>
              ) : null}
              {suggestion.additionalNotes ? (
                <div>
                  <dt className="text-ink-faint">Əlavə izah</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-ink">{suggestion.additionalNotes}</dd>
                </div>
              ) : null}
              {!suggestion.fieldOrSection && !suggestion.suggestedChange && !suggestion.additionalNotes ? (
                <p className="text-ink-faint">Mətn təklifi yoxdur — yalnız şəkil göndərilib.</p>
              ) : null}
            </dl>
          </div>

          {suggestion.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only raw URL preview
            <img src={suggestion.photoUrl} alt="" className="mt-4 aspect-square w-full max-w-sm rounded-md object-cover" />
          ) : null}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-lg border border-stone-light bg-paper p-4">
            <h2 className="text-sm font-semibold text-ink">Göndərən</h2>
            <dl className="mt-2 grid gap-2 text-sm">
              <div>
                <dt className="text-ink-faint">Ad, soyad</dt>
                <dd className="font-medium text-ink">{suggestion.submitterName ?? "Bildirilməyib"}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Əlaqə</dt>
                <dd className="font-medium text-ink">{suggestion.contactInfo ?? "Bildirilməyib"}</dd>
              </div>
            </dl>
          </div>

          <CorrectionModerationActions suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
