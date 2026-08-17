import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HistoryForm } from "@/components/admin/history/HistoryForm";

export const metadata = { title: "Yeni tarix qeydi — Admin — Musaküçə" };

export default function AdminNewHistoryPage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni tarix qeydi"
        breadcrumb={[{ label: "Tariximiz", href: "/admin/tarix" }, { label: "Yeni tarix qeydi" }]}
      />
      <HistoryForm />
    </div>
  );
}
