import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listingsApi } from "@/lib/api/listings";
import { eventsApi } from "@/lib/api/events";
import { peopleApi } from "@/lib/api/people";
import { historyApi } from "@/lib/api/history";
import { photosApi } from "@/lib/api/photos";
import { videosApi } from "@/lib/api/videos";
import { submissionsApi } from "@/lib/api/submissions";
import { localInfoApi } from "@/lib/api/localInfo";
import { isNextRedirectError } from "@/lib/isNextRedirectError";

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

type Stat = { label: string; value: number | null; href: string };

export default async function AdminDashboardPage() {
  const [
    pendingListings,
    activeListings,
    upcomingEvents,
    pendingSubmissions,
    publishedPeople,
    publishedHistory,
    publishedPhotos,
    publishedVideos,
    publishedLocalInfo,
  ] = await Promise.all([
    safeCount(() => listingsApi.getPaged({ moderationStatus: "Pending", pageSize: 1 })),
    safeCount(() => listingsApi.getPaged({ listingStatus: "Active", moderationStatus: "Approved", pageSize: 1 })),
    safeCount(() =>
      eventsApi.getPaged({ publicationStatus: "Published", from: new Date().toISOString(), pageSize: 1 }),
    ),
    safeCount(() => submissionsApi.getPaged({ status: "Pending", pageSize: 1 })),
    safeCount(() => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => historyApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => photosApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => videosApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
    safeCount(() => localInfoApi.getPaged({ publicationStatus: "Published", pageSize: 1 })),
  ]);

  const moderationStats: Stat[] = [
    { label: "Gözləyən elanlar", value: pendingListings, href: "/admin/elanlar?status=Pending" },
    { label: "Aktiv elanlar", value: activeListings, href: "/admin/elanlar?status=Active" },
    { label: "Gələcək tədbirlər", value: upcomingEvents, href: "/admin/teqvim" },
    { label: "Baxılmalı göndərişlər", value: pendingSubmissions, href: "/admin/gonderisler?status=Pending" },
  ];

  const contentStats: Stat[] = [
    { label: "Dərc edilmiş insanlar", value: publishedPeople, href: "/admin/insanlar" },
    { label: "Dərc edilmiş tarix qeydləri", value: publishedHistory, href: "/admin/tarix" },
    { label: "Dərc edilmiş fotolar", value: publishedPhotos, href: "/admin/fotoalbom" },
    { label: "Dərc edilmiş videolar", value: publishedVideos, href: "/admin/videolar" },
    { label: "Dərc edilmiş faydalı məlumatlar", value: publishedLocalInfo, href: "/admin/faydali-melumatlar" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Backend-dən gələn həqiqi göstəricilər — heç bir rəqəm uydurulmayıb."
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Diqqət tələb edir</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {moderationStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Arxiv məzmunu</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {contentStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Sürətli əməliyyatlar</h2>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/teqvim/yeni" size="sm">
            + Tədbir əlavə et
          </Button>
          <Button href="/admin/faydali-melumatlar/yeni" size="sm" variant="outline">
            + Faydalı məlumat əlavə et
          </Button>
          <Button href="/admin/insanlar/yeni" size="sm" variant="outline">
            + Şəxs əlavə et
          </Button>
          <Button href="/admin/tarix/yeni" size="sm" variant="outline">
            + Tarix qeydi əlavə et
          </Button>
          <Button href="/admin/fotoalbom/yeni" size="sm" variant="outline">
            + Foto əlavə et
          </Button>
          <Button href="/admin/videolar/yeni" size="sm" variant="outline">
            + Video əlavə et
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: Stat) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-forest">
        <CardBody className="p-4">
          <p className="text-2xl font-bold text-ink">{value === null ? "—" : value}</p>
          <p className="mt-1 text-xs text-ink-soft">{label}</p>
          {value === null ? <p className="mt-1 text-xs text-danger">Yüklənmədi</p> : null}
        </CardBody>
      </Card>
    </Link>
  );
}
