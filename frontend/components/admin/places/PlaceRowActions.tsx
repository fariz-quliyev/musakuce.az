"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { placesApi } from "@/lib/api/places";
import type { PlaceDto, PublicationStatus } from "@/lib/api/types";

export function PlaceRowActions({ place }: { place: PlaceDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={place.publicationStatus}
      title={place.name}
      onChangeStatus={(publicationStatus: PublicationStatus) => placesApi.updateStatus(place.id, { publicationStatus })}
      onDelete={() => placesApi.remove(place.id)}
    />
  );
}
