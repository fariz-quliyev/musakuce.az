"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { memorialApi } from "@/lib/api/memorial";
import type { MemorialRecordDto, PublicationStatus } from "@/lib/api/types";

export function MemorialRowActions({ record }: { record: MemorialRecordDto }) {
  return (
    <PublicationStatusActions
      status={record.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => memorialApi.updateStatus(record.id, { publicationStatus })}
    />
  );
}
