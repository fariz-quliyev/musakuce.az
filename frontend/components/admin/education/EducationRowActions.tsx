"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { educationApi } from "@/lib/api/education";
import type { EducationEntryDto, PublicationStatus } from "@/lib/api/types";

export function EducationRowActions({ entry }: { entry: EducationEntryDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={entry.publicationStatus}
      title={entry.title}
      onChangeStatus={(publicationStatus: PublicationStatus) => educationApi.updateStatus(entry.id, { publicationStatus })}
      onDelete={() => educationApi.remove(entry.id)}
    />
  );
}
