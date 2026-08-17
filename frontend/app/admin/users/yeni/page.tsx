import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateUserForm } from "@/components/admin/users/CreateUserForm";

export const metadata = { title: "Yeni istifadəçi — Admin — Musaküçə" };

export default function AdminNewUserPage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni istifadəçi"
        description="Açıq qeydiyyat yoxdur — hesab yalnız burada yaradılır."
        breadcrumb={[{ label: "İstifadəçilər", href: "/admin/users" }, { label: "Yeni istifadəçi" }]}
      />
      <CreateUserForm />
    </div>
  );
}
