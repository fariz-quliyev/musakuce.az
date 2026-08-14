import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemorialForm } from "@/components/admin/memorial/MemorialForm";
import { getPersonOptions } from "@/lib/admin/personOptions";

export const metadata = { title: "Yeni xatirə qeydi — Admin — Musaküçə" };

export default async function AdminNewMemorialPage() {
  const personOptions = await getPersonOptions();
  return (
    <div>
      <AdminPageHeader title="Yeni xatirə qeydi" />
      <MemorialForm personOptions={personOptions} />
    </div>
  );
}
