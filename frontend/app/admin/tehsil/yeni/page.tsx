import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EducationForm } from "@/components/admin/education/EducationForm";
import { getPersonOptions } from "@/lib/admin/personOptions";

export const metadata = { title: "Yeni təhsil qeydi — Admin — Musaküçə" };

export default async function AdminNewEducationPage() {
  const personOptions = await getPersonOptions();
  return (
    <div>
      <AdminPageHeader title="Yeni təhsil qeydi" />
      <EducationForm personOptions={personOptions} />
    </div>
  );
}
