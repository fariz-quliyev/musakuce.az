"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import type { CulturalHeritageItemDto, PublicationStatus } from "@/lib/api/types";

export function CulturalHeritageRowActions({ item }: { item: CulturalHeritageItemDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={item.publicationStatus}
      title={item.title}
      onChangeStatus={(publicationStatus: PublicationStatus) => culturalHeritageApi.updateStatus(item.id, { publicationStatus })}
      onDelete={() => culturalHeritageApi.remove(item.id)}
    />
  );
}
