import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InterviewForm } from "@/components/admin/interviews/InterviewForm";
import { getPersonOptions } from "@/lib/admin/personOptions";

export const metadata = { title: "Yeni müsahibə — Admin — Musaküçə" };

export default async function AdminNewInterviewPage() {
  const personOptions = await getPersonOptions();
  return (
    <div>
      <AdminPageHeader
        title="Yeni müsahibə"
        breadcrumb={[{ label: "Kəndimizin səsi", href: "/admin/kendimizin-sesi" }, { label: "Yeni müsahibə" }]}
      />
      <InterviewForm personOptions={personOptions} />
    </div>
  );
}
