"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { eventsApi } from "@/lib/api/events";
import type { EventDto, PublicationStatus } from "@/lib/api/types";

export function EventRowActions({ event }: { event: EventDto }) {
  return (
    <PublicationStatusActions
      status={event.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        eventsApi.updateStatus(event.id, { publicationStatus })
      }
    />
  );
}
