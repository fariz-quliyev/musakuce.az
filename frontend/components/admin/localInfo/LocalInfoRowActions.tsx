"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { localInfoApi } from "@/lib/api/localInfo";
import type { LocalInfoEntryDto, PublicationStatus } from "@/lib/api/types";

export function LocalInfoRowActions({ entry }: { entry: LocalInfoEntryDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={entry.publicationStatus}
      title={entry.name}
      onChangeStatus={(publicationStatus: PublicationStatus) => localInfoApi.updateStatus(entry.id, { publicationStatus })}
      onDelete={() => localInfoApi.remove(entry.id)}
    />
  );
}
