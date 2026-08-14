"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { localInfoApi } from "@/lib/api/localInfo";
import type { LocalInfoEntryDto, PublicationStatus } from "@/lib/api/types";

export function LocalInfoRowActions({ entry }: { entry: LocalInfoEntryDto }) {
  return (
    <PublicationStatusActions
      status={entry.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        localInfoApi.updateStatus(entry.id, { publicationStatus })
      }
    />
  );
}
