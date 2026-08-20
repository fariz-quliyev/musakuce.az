"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { historyApi } from "@/lib/api/history";
import type { HistoricalEventDto, PublicationStatus } from "@/lib/api/types";

/**
 * History keeps its own row-actions component instead of delegating
 * wholesale to PublicationStatusActions (still shared by whatever
 * resources haven't switched to hard delete) — only the Published-row
 * unpublish button is replaced with "Sil". Now backed by the shared
 * PublicationStatusActionsWithDelete bar, extracted from this file's own
 * original implementation once the same change was needed for 9 more
 * content types.
 */
export function HistoryRowActions({ event }: { event: HistoricalEventDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={event.publicationStatus}
      title={event.title}
      deleteConfirmLabel="Bu timeline qeydini"
      onChangeStatus={(publicationStatus: PublicationStatus) => historyApi.updateStatus(event.id, { publicationStatus })}
      onDelete={() => historyApi.remove(event.id)}
    />
  );
}
