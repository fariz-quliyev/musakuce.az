import type { HistoricalEventDto } from "@/lib/api/types";

// Seeded placeholder events (HistoricalEventDto.isDefault) carry an
// admin-facing "this is sample content" notice in their Description —
// never shown to a public visitor, not even in the server-rendered page
// source. Applied server-side (before the event ever becomes a client
// component prop) so the raw notice never reaches the RSC payload; the
// admin list flags these rows with a "Nümunə" badge instead (see
// HistoryTable.tsx).
export const DEFAULT_EVENT_NOTICE = "Bu hadisə haqqında məlumat hazırlanır — tezliklə əlavə olunacaq.";

export function withPublicDescription(event: HistoricalEventDto): HistoricalEventDto {
  return event.isDefault ? { ...event, description: DEFAULT_EVENT_NOTICE } : event;
}
