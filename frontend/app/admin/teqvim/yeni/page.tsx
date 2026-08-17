import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventForm } from "@/components/admin/events/EventForm";

export const metadata = { title: "Yeni tədbir — Admin — Musaküçə" };

export default function AdminNewEventPage() {
  return (
    <div>
      <AdminPageHeader
        title="Yeni tədbir"
        breadcrumb={[{ label: "Təqvim", href: "/admin/teqvim" }, { label: "Yeni tədbir" }]}
      />
      <EventForm />
    </div>
  );
}
