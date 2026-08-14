"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { memorialApi } from "@/lib/api/memorial";
import type { MemorialRecordDto, PublicationStatus } from "@/lib/api/types";

/**
 * `canModerate` is UX only — the server independently re-enforces
 * `memorial.moderate` on `PATCH /api/memorial/{id}/status` regardless of
 * what this component renders (see Permissions.cs / MemorialController).
 * Hiding the button here just keeps an Archivist (who legitimately holds
 * `memorial.write` but not `memorial.moderate`, per spec §13) from being
 * shown a publish/archive control that would 403 if clicked.
 */
export function MemorialRowActions({ record, canModerate }: { record: MemorialRecordDto; canModerate: boolean }) {
  if (!canModerate) return null;
  return (
    <PublicationStatusActions
      status={record.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => memorialApi.updateStatus(record.id, { publicationStatus })}
    />
  );
}
