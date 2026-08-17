import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CulturalHeritageForm } from "@/components/admin/culturalHeritage/CulturalHeritageForm";

export const metadata = { title: "Yeni mədəni irs məzmunu — Admin — Musaküçə" };

export default function AdminNewCulturalHeritagePage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni mədəni irs məzmunu"
        breadcrumb={[{ label: "Mədəni irs", href: "/admin/medeni-iras" }, { label: "Yeni mədəni irs məzmunu" }]}
      />
      <CulturalHeritageForm />
    </div>
  );
}
