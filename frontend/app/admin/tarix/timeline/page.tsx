import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TimelineSettingsForm } from "@/components/admin/timelineSettings/TimelineSettingsForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { timelineSettingsApi } from "@/lib/api/timelineSettings";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { TimelineSettingsDto } from "@/lib/api/types";

export const metadata = { title: "Timeline ayarları — Admin — Musaküçə" };

export default async function AdminTimelineSettingsPage() {
  let settings: TimelineSettingsDto | null;
  try {
    settings = await timelineSettingsApi.get();
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) {
      settings = null;
    } else if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Timeline ayarlarını idarə etmək üçün icazəniz yoxdur." />;
    } else {
      return <EmptyState tone="error" title="Timeline ayarlarını yükləmək mümkün olmadı" />;
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Timeline ayarları"
        description="/kendimiz səhifəsindəki 'Zaman xəttində Musaküçə' bölməsinin başlığı, alt mətni və göstərilmə davranışı."
        breadcrumb={[{ label: "Tariximiz", href: "/admin/tarix" }, { label: "Timeline ayarları" }]}
      />
      {!settings ? (
        <p className="mb-6 text-sm text-ink-soft">
          Hələ heç bir ayar yadda saxlanılmayıb — formu doldurub &ldquo;Yadda saxla&rdquo; düyməsini basın.
        </p>
      ) : null}
      <TimelineSettingsForm settings={settings} />
    </div>
  );
}
