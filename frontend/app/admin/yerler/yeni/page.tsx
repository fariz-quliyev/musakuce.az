import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlaceForm } from "@/components/admin/places/PlaceForm";

export const metadata = { title: "Yeni yer — Admin — Musaküçə" };

export default function AdminNewPlacePage() {
  return (
    <div>
      <AdminPageHeader title="Yeni yer" />
      <PlaceForm />
    </div>
  );
}
