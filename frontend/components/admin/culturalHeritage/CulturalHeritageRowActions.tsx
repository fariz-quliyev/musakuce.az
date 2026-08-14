"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import type { CulturalHeritageItemDto, PublicationStatus } from "@/lib/api/types";

export function CulturalHeritageRowActions({ item }: { item: CulturalHeritageItemDto }) {
  return (
    <PublicationStatusActions
      status={item.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => culturalHeritageApi.updateStatus(item.id, { publicationStatus })}
    />
  );
}
