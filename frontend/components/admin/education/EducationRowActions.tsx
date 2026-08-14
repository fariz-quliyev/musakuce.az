"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { educationApi } from "@/lib/api/education";
import type { EducationEntryDto, PublicationStatus } from "@/lib/api/types";

export function EducationRowActions({ entry }: { entry: EducationEntryDto }) {
  return (
    <PublicationStatusActions
      status={entry.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => educationApi.updateStatus(entry.id, { publicationStatus })}
    />
  );
}
