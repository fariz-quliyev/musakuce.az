import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PersonForm } from "@/components/admin/people/PersonForm";

export const metadata = { title: "Yeni şəxs — Admin — Musaküçə" };

export default function AdminNewPersonPage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni şəxs"
        breadcrumb={[{ label: "İnsanlarımız", href: "/admin/insanlar" }, { label: "Yeni şəxs" }]}
      />
      <PersonForm />
    </div>
  );
}
