"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { memorialApi } from "@/lib/api/memorial";
import type { MemorialRecordDto, PublicationStatus } from "@/lib/api/types";

/**
 * `canModerate` is UX only — the server independently re-enforces
 * `memorial.moderate` on `PATCH/DELETE /api/memorial/{id}` regardless of
 * what this component renders (see Permissions.cs / MemorialController).
 * Hiding the bar here just keeps an Archivist (who legitimately holds
 * `memorial.write` but not `memorial.moderate`, per spec §13) from being
 * shown publish/archive/delete controls that would 403 if clicked.
 */
export function MemorialRowActions({ record, canModerate }: { record: MemorialRecordDto; canModerate: boolean }) {
  if (!canModerate) return null;
  return (
    <PublicationStatusActionsWithDelete
      status={record.publicationStatus}
      title={record.fullName}
      onChangeStatus={(publicationStatus: PublicationStatus) => memorialApi.updateStatus(record.id, { publicationStatus })}
      onDelete={() => memorialApi.remove(record.id)}
    />
  );
}
