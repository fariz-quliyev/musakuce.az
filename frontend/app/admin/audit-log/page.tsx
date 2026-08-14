import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { auditLogApi } from "@/lib/api/auditLog";
import { ApiError } from "@/lib/api/client";
import { isNextRedirectError } from "@/lib/isNextRedirectError";

export const metadata = { title: "Audit qeydiyyatı — Admin — Musaküçə" };

type SearchParams = {
  page?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  search?: string;
};

export default async function AdminAuditLogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  let result;
  try {
    result = await auditLogApi.getPaged({
      page,
      pageSize: 30,
      action: params.action || undefined,
      entityType: params.entityType || undefined,
      from: params.from || undefined,
      to: params.to || undefined,
      search: params.search || undefined,
    });
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    if (error instanceof ApiError && error.status === 403) {
      return (
        <EmptyState
          tone="error"
          title="İcazəniz yoxdur"
          description="Audit qeydiyyatına baxmaq yalnız Administrator roluna açıqdır."
        />
      );
    }
    return <EmptyState tone="error" title="Audit qeydiyyatını yükləmək mümkün olmadı" />;
  }

  const buildPageHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (params.action) qs.set("action", params.action);
    if (params.entityType) qs.set("entityType", params.entityType);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.search) qs.set("search", params.search);
    qs.set("page", String(targetPage));
    return `/admin/audit-log?${qs.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        title="Audit qeydiyyatı"
        description="Bütün admin əməliyyatlarının qeydi — giriş, yaratma, redaktə, dərc etmə, təsdiq, rədd, arxivləşdirmə, rol dəyişiklikləri."
      />

      <form method="GET" className="mb-6 grid gap-4 rounded-lg border border-stone-light bg-paper p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FormField label="Axtarış" htmlFor="search" hint="E-poçt və ya qeyd ID-si">
          <Input id="search" name="search" defaultValue={params.search} />
        </FormField>
        <FormField label="Əməliyyat" htmlFor="action" hint="məs. Create, Publish, Login">
          <Input id="action" name="action" defaultValue={params.action} />
        </FormField>
        <FormField label="Növ" htmlFor="entityType" hint="məs. ClassifiedListing, Person">
          <Input id="entityType" name="entityType" defaultValue={params.entityType} />
        </FormField>
        <FormField label="Başlanğıc tarixi" htmlFor="from">
          <Input id="from" name="from" type="date" defaultValue={params.from} />
        </FormField>
        <FormField label="Son tarix" htmlFor="to">
          <Input id="to" name="to" type="date" defaultValue={params.to} />
        </FormField>
        <div className="sm:col-span-2 lg:col-span-5">
          <Button type="submit" size="sm">
            Filtrlə
          </Button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title="Bu filtrlərə uyğun qeyd tapılmadı" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-stone-light bg-paper">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-light bg-paper-soft text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3">Tarix</th>
                  <th className="px-4 py-3">İstifadəçi</th>
                  <th className="px-4 py-3">Əməliyyat</th>
                  <th className="px-4 py-3">Növ / ID</th>
                  <th className="px-4 py-3">Köhnə → Yeni</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((entry) => (
                  <tr key={entry.id} className="border-b border-stone-light last:border-0 hover:bg-paper-soft">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-faint">
                      {new Date(entry.timestamp).toLocaleString("az-AZ")}
                    </td>
                    <td className="px-4 py-3">{entry.actorEmail ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-ink">{entry.action}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {entry.entityType ?? "—"}
                      {entry.entityId ? <span className="block truncate text-xs text-ink-faint">{entry.entityId}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {entry.oldValue || entry.newValue ? `${entry.oldValue ?? "—"} → ${entry.newValue ?? "—"}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-faint">{entry.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              href={buildPageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-40" : "text-sm font-medium text-forest hover:underline"}
            >
              ← Əvvəlki
            </Link>
            <span className="text-sm text-ink-soft">
              {result.page} / {result.totalPages || 1}
            </span>
            <Link
              href={buildPageHref(page + 1)}
              aria-disabled={page >= result.totalPages}
              className={
                page >= result.totalPages ? "pointer-events-none opacity-40" : "text-sm font-medium text-forest hover:underline"
              }
            >
              Növbəti →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
