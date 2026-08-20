"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { eventsApi } from "@/lib/api/events";
import type { EventDto, PublicationStatus } from "@/lib/api/types";

export function EventRowActions({ event }: { event: EventDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={event.publicationStatus}
      title={event.title}
      onChangeStatus={(publicationStatus: PublicationStatus) => eventsApi.updateStatus(event.id, { publicationStatus })}
      onDelete={() => eventsApi.remove(event.id)}
    />
  );
}
