import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmissionStatusBadge } from "@/components/admin/StatusBadge";
import { SubmissionModerationActions } from "@/components/admin/submissions/SubmissionModerationActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { submissionsApi } from "@/lib/api/submissions";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import { submissionKindLabels } from "@/lib/api/labels";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Göndəriş — Admin — Musaküçə" };

export default async function AdminSubmissionDetailPage({ params }: Props) {
  const { id } = await params;

  let submission;
  try {
    submission = await submissionsApi.getById(id);
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return <EmptyState tone="error" title="İcazəniz yoxdur" description="Bu göndərişə baxmaq üçün icazəniz yoxdur." />;
    }
    return <EmptyState tone="error" title="Göndərişi yükləmək mümkün olmadı" />;
  }

  return (
    <div>
      <AdminPageHeader
        title={submissionKindLabels[submission.kind]}
        description={new Date(submission.createdAt).toLocaleDateString("az-AZ", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        breadcrumb={[{ label: "Göndərişlər", href: "/admin/gonderisler" }, { label: submissionKindLabels[submission.kind] }]}
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-stone-light bg-paper p-5">
            <h2 className="text-sm font-semibold text-ink">Təsvir</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{submission.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-stone-light pt-4 text-sm">
              {submission.suggestedDate ? (
                <div>
                  <dt className="text-ink-faint">Təklif edilən tarix</dt>
                  <dd className="mt-0.5 font-medium text-ink">{submission.suggestedDate}</dd>
                </div>
              ) : null}
              {submission.suggestedLocation ? (
                <div>
                  <dt className="text-ink-faint">Təklif edilən yer</dt>
                  <dd className="mt-0.5 font-medium text-ink">{submission.suggestedLocation}</dd>
                </div>
              ) : null}
              {submission.peopleShown ? (
                <div className="col-span-2">
                  <dt className="text-ink-faint">Şəkildə göstərilən insanlar</dt>
                  <dd className="mt-0.5 font-medium text-ink">{submission.peopleShown}</dd>
                </div>
              ) : null}
              {submission.sourceNote ? (
                <div className="col-span-2">
                  <dt className="text-ink-faint">Mənbə qeydi</dt>
                  <dd className="mt-0.5 font-medium text-ink">{submission.sourceNote}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-4 text-xs text-ink-faint">
              Dərc etmə icazəsi: {submission.permissionToPublish ? "Verilib" : "Verilməyib"}
            </p>
          </div>

          {submission.fileUrls.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {submission.fileUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element -- admin-only raw URL preview
                <img key={url} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-ink-faint">Fayl əlavə edilməyib.</p>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-lg border border-stone-light bg-paper p-4">
            <h2 className="text-sm font-semibold text-ink">Göndərən</h2>
            <dl className="mt-2 grid gap-2 text-sm">
              <div>
                <dt className="text-ink-faint">Ad, soyad</dt>
                <dd className="font-medium text-ink">{submission.submitterName}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Əlaqə</dt>
                <dd className="font-medium text-ink">{submission.contactInfo}</dd>
              </div>
            </dl>
          </div>

          <SubmissionModerationActions submission={submission} />
        </div>
      </div>
    </div>
  );
}
