import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LocalInfoForm } from "@/components/admin/localInfo/LocalInfoForm";

export const metadata = { title: "Yeni faydalı məlumat — Admin — Musaküçə" };

export default function AdminNewLocalInfoPage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni faydalı məlumat"
        breadcrumb={[{ label: "Faydalı məlumatlar", href: "/admin/faydali-melumatlar" }, { label: "Yeni faydalı məlumat" }]}
      />
      <LocalInfoForm />
    </div>
  );
}
