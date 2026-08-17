import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PublicationStatusBadge } from "@/components/admin/StatusBadge";
import { VillageProfileRowActions } from "@/components/admin/villageProfile/VillageProfileRowActions";
import { VillageProfileForm } from "@/components/admin/villageProfile/VillageProfileForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { villageProfileApi } from "@/lib/api/villageProfile";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { PublicationStatus, VillageProfileDto } from "@/lib/api/types";

export const metadata = { title: "Kəndimiz — Admin — Musaküçə" };

/** Singleton content type — no list, only ever one row. Try each status
 * in turn (Draft is what an editor is usually mid-way through; Published
 * is the live version; Archived only if somehow neither exists) so the
 * admin always lands on whatever currently exists, or a blank form if
 * nothing has ever been saved yet. */
async function loadCurrentProfile(): Promise<VillageProfileDto | null> {
  for (const status of ["Draft", "Published", "Archived"] as PublicationStatus[]) {
    try {
      return await villageProfileApi.get(status);
    } catch (error) {
      if (isNextRedirectError(error)) throw error;
      if (error instanceof ApiError && error.status === 404) continue;
      throw error;
    }
  }
  return null;
}

export default async function AdminKendimizPage() {
  let profile: VillageProfileDto | null;
  try {
    profile = await loadCurrentProfile();
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Kənd profilini idarə etmək üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Kənd profilini yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Kəndimiz"
        description="Baş səhifədə göstərilən kənd məlumatları — əhali, ərazi, coğrafiya, ad mənşəyi."
        actions={
          profile ? (
            <div className="flex items-center gap-3">
              <PublicationStatusBadge status={profile.publicationStatus} />
              <VillageProfileRowActions profile={profile} />
            </div>
          ) : undefined
        }
      />
      {!profile ? (
        <p className="mb-6 text-sm text-ink-soft">
          Hələ heç bir məlumat yadda saxlanılmayıb — formu doldurub &ldquo;Yadda saxla&rdquo; düyməsini basın, sonra dərc edin.
        </p>
      ) : null}
      <VillageProfileForm profile={profile} />
    </div>
  );
}
