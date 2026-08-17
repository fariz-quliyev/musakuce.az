import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuickAddMenu } from "@/components/admin/QuickAddMenu";
import { Card, CardBody } from "@/components/ui/Card";
import { listingsApi } from "@/lib/api/listings";
import { eventsApi } from "@/lib/api/events";
import { peopleApi } from "@/lib/api/people";
import { historyApi } from "@/lib/api/history";
import { photosApi } from "@/lib/api/photos";
import { videosApi } from "@/lib/api/videos";
import { submissionsApi } from "@/lib/api/submissions";
import { localInfoApi } from "@/lib/api/localInfo";
import { auditLogApi } from "@/lib/api/auditLog";
import { isNextRedirectError } from "@/lib/isNextRedirectError";
import type { AuditLogEntryDto } from "@/lib/api/types";

export const metadata = { title: "Dashboard — Admin — Musaküçə" };

/** Reads only `totalCount` from a pageSize=1 paged call — cheap and
 * always reflects real data, never an invented number. A role that
 * lacks permission for a given resource just sees "—" for that tile
 * (403 is swallowed here same as any other failure) rather than the
 * whole dashboard erroring out. */
async function safeCount(fetcher: () => Promise<{ totalCount: number }>): Promise<number | null> {
  try {
    const result = await fetcher();
    return result.totalCount;
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    return null;
  }
}

/** Recent-activity feed is a nice-to-have, not core dashboard function —
 * any failure (403 for non-Administrator roles, since /api/audit-log is
 * Administrator-only, or any other error) just hides the section rather
 * than showing an error block. */
async function safeRecentActivity(): Promise<AuditLogEntryDto[] | null> {
  try {
    const result = await auditLogApi.getPaged({ pageSize: 20 });
    return result.items;
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    return null;
  }
}

type Stat = { label: string; value: number | null; href: string; secondary?: string | null };

const ACTIVITY_ENTITY_LABELS: Record<string, string> = {
  Photo: "Foto",
  Person: "Şəxs",
  HistoricalEvent: "Tarix qeydi",
  VillageEvent: "Tədbir",
  Video: "Video",
  LocalInfoEntry: "Faydalı məlumat",
  ClassifiedListing: "Elan",
  CulturalHeritageItem: "Mədəni irs qeydi",
  MemorialRecord: "Xatirə qeydi",
  Interview: "Kəndimizin səsi qeydi",
  EducationEntry: "Təhsil qeydi",
  Place: "Məkan",
  CommunitySubmission: "Göndəriş",
  VillageProfile: "Kənd profili",
};

const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  Create: "əlavə edildi",
  Update: "yeniləndi",
  Publish: "dərc edildi",
  Unpublish: "dərcdən çıxarıldı",
  Archive: "arxivləşdirildi",
  Approve: "təsdiqləndi",
  Reject: "rədd edildi",
  Convert: "emal edildi",
  ListingStatusChange: "statusu dəyişdi",
  ModerationStatusChange: "moderasiya statusu dəyişdi",
  SubmissionStatusChange: "statusu dəyişdi",
};

/** Only domain-content events are shown here (a Create/Publish/etc. on an
 * actual record) — raw media-upload and auth events (Login, MediaUpload…)
 * are implementation detail, not the "what changed" story this section
 * tells, so they're filtered out client-side rather than shown as noise. */
function describeActivity(entry: AuditLogEntryDto): string | null {
  if (!entry.entityType) return null;
  const noun = ACTIVITY_ENTITY_LABELS[entry.entityType];
  if (!noun) return null;
  const verb = ACTIVITY_ACTION_LABELS[entry.action] ?? `${entry.action} edildi`;
  return `${noun} ${verb}`;
}

function formatActivityTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "indicə";
  if (diffMin < 60) return `${diffMin} dəqiqə əvvəl`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat əvvəl`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "dünən";
  if (diffDays < 30) return `${diffDays} gün əvvəl`;
  return new Date(iso).toLocaleDateString("az-AZ");
}

export default async function AdminDashboardPage() {
  const [
    pendingListings,
    activeListings,
    upcomingEvents,
    pendingSubmissions,
    publishedPeople,
    draftPeople,
    publishedHistory,
    draftHistory,
    publishedPhotos,
    draftPhotos,
    publishedVideos,
    draftVideos,
    publishedLocalInfo,
    draftLocalInfo,
    recentActivity,
  ] = await Promise.all([
    safeCount(() => listingsApi.getPaged({ moderationStatus: "Pending", pageSize: 1 })),
    safeCount(() => listingsApi.getPaged({ listingStatus: "Active", moderationStatus: "Approved", pageSize: 1 })),
    safeCount(() =>
      eventsApi.getPaged({ publicationStatus: "Published", from: new Date().toISOString(), pageSize: 1 }),
    ),
    safeCount(() => submissionsApi.getPaged({ status: "Pending", pageSize: 1 })),
    safeCount(() => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => peopleApi.getPaged({ publicationStatus: "Draft", pageSize: 1 })),
    safeCount(() => historyApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => historyApi.getPaged({ publicationStatus: "Draft", pageSize: 1 })),
    safeCount(() => photosApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => photosApi.getPaged({ publicationStatus: "Draft", pageSize: 1 })),
    safeCount(() => videosApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => videosApi.getPaged({ publicationStatus: "Draft", pageSize: 1 })),
    safeCount(() => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => localInfoApi.getPaged({ publicationStatus: "Draft", pageSize: 1 })),
    safeRecentActivity(),
  ]);

  const draftSecondary = (draft: number | null) => (draft && draft > 0 ? `${draft} qaralama` : null);

  // Only genuinely actionable/pending items belong here — "Aktiv elanlar"
  // and "Gələcək tədbirlər" are current-state counts, not a queue, so they
  // live in the general stats section below instead.
  const moderationStats: Stat[] = [
    { label: "Gözləyən elanlar", value: pendingListings, href: "/admin/elanlar?status=Pending" },
    { label: "Baxılmalı göndərişlər", value: pendingSubmissions, href: "/admin/gonderisler?status=Pending" },
  ];
  const pendingStats = moderationStats.filter((stat) => stat.value !== 0);

  const generalStats: Stat[] = [
    { label: "Aktiv elanlar", value: activeListings, href: "/admin/elanlar?status=Active" },
    { label: "Gələcək tədbirlər", value: upcomingEvents, href: "/admin/teqvim" },
    { label: "Dərc edilmiş insanlar", value: publishedPeople, href: "/admin/insanlar", secondary: draftSecondary(draftPeople) },
    { label: "Dərc edilmiş tarix qeydləri", value: publishedHistory, href: "/admin/tarix", secondary: draftSecondary(draftHistory) },
    { label: "Dərc edilmiş fotolar", value: publishedPhotos, href: "/admin/fotoalbom", secondary: draftSecondary(draftPhotos) },
    { label: "Dərc edilmiş videolar", value: publishedVideos, href: "/admin/videolar", secondary: draftSecondary(draftVideos) },
    { label: "Dərc edilmiş faydalı məlumatlar", value: publishedLocalInfo, href: "/admin/faydali-melumatlar", secondary: draftSecondary(draftLocalInfo) },
  ];

  const activityLines = (recentActivity ?? [])
    .map((entry) => {
      const description = describeActivity(entry);
      return description ? { id: entry.id, description, timestamp: entry.timestamp } : null;
    })
    .filter((line): line is { id: string; description: string; timestamp: string } => line !== null)
    .slice(0, 8);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Backend-dən gələn həqiqi göstəricilər — heç bir rəqəm uydurulmayıb."
        actions={<QuickAddMenu />}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Diqqət tələb edir</h2>
        {pendingStats.length === 0 ? (
          <p className="rounded-lg border border-stone-light bg-paper-soft px-4 py-3 text-sm text-ink-soft">
            ✓ Hazırda diqqət tələb edən iş yoxdur.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pendingStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Ümumi statistika</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {generalStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {recentActivity !== null ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Son fəaliyyətlər</h2>
          <Card>
            <CardBody className="p-0">
              {activityLines.length === 0 ? (
                <p className="px-4 py-4 text-sm text-ink-soft">Hələ heç bir fəaliyyət qeydə alınmayıb.</p>
              ) : (
                <ul>
                  {activityLines.map((line, i) => (
                    <li
                      key={line.id}
                      className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${i > 0 ? "border-t border-stone-light" : ""}`}
                    >
                      <span className="min-w-0 flex-1 truncate text-ink">{line.description}</span>
                      <span className="shrink-0 text-xs text-ink-faint">{formatActivityTime(line.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, href, secondary }: Stat) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-forest">
        <CardBody className="p-4">
          <p className="text-2xl font-bold text-ink">{value === null ? "—" : value}</p>
          <p className="mt-1 text-xs text-ink-soft">{label}</p>
          {secondary ? <p className="mt-1 text-[11px] text-ink-faint">{secondary}</p> : null}
          {value === null ? <p className="mt-1 text-xs text-danger">Yüklənmədi</p> : null}
        </CardBody>
      </Card>
    </Link>
  );
}
