"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { placesApi } from "@/lib/api/places";
import type { PlaceDto, PublicationStatus } from "@/lib/api/types";

export function PlaceRowActions({ place }: { place: PlaceDto }) {
  return (
    <PublicationStatusActions
      status={place.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        placesApi.updateStatus(place.id, { publicationStatus })
      }
    />
  );
}
