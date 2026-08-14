"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { photosApi } from "@/lib/api/photos";
import type { PhotoDto, PublicationStatus } from "@/lib/api/types";

export function PhotoRowActions({ photo }: { photo: PhotoDto }) {
  return (
    <PublicationStatusActions
      status={photo.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        photosApi.updateStatus(photo.id, { publicationStatus })
      }
    />
  );
}
