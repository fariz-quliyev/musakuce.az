"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { historyApi } from "@/lib/api/history";
import type { HistoricalEventDto, PublicationStatus } from "@/lib/api/types";

export function HistoryRowActions({ event }: { event: HistoricalEventDto }) {
  return (
    <PublicationStatusActions
      status={event.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        historyApi.updateStatus(event.id, { publicationStatus })
      }
    />
  );
}
