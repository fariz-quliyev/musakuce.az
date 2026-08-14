import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoForm } from "@/components/admin/videos/VideoForm";

export const metadata = { title: "Yeni video — Admin — Musaküçə" };

export default function AdminNewVideoPage() {
  return (
    <div>
      <AdminPageHeader title="Yeni video" />
      <VideoForm />
    </div>
  );
}
