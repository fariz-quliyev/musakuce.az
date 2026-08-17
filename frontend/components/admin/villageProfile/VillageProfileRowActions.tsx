"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { villageProfileApi } from "@/lib/api/villageProfile";
import type { PublicationStatus, VillageProfileDto } from "@/lib/api/types";

export function VillageProfileRowActions({ profile }: { profile: VillageProfileDto }) {
  return (
    <PublicationStatusActions
      status={profile.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => villageProfileApi.updateStatus({ publicationStatus })}
    />
  );
}
