import { peopleApi } from "@/lib/api/people";

/** Small dropdown source for "link to an İnsanlarımız profile" fields
 * (Memorial, Interview). Best-effort — an empty list just means the
 * dropdown shows only "—", never breaks the page. */
export async function getPersonOptions(): Promise<{ id: string; name: string }[]> {
  try {
    const result = await peopleApi.getPaged({ publicationStatus: "Published", pageSize: 200 });
    return result.items.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }));
  } catch {
    return [];
  }
}
