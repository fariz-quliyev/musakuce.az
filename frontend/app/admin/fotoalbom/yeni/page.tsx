import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoForm } from "@/components/admin/photos/PhotoForm";

export const metadata = { title: "Yeni foto — Admin — Musaküçə" };

export default function AdminNewPhotoPage() {
  return (
    <div>
      <AdminPageHeader title="Yeni foto" />
      <PhotoForm />
    </div>
  );
}
