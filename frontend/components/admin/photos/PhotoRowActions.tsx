"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { photosApi } from "@/lib/api/photos";
import type { PhotoDto, PublicationStatus } from "@/lib/api/types";

export function PhotoRowActions({ photo }: { photo: PhotoDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={photo.publicationStatus}
      title={photo.title}
      onChangeStatus={(publicationStatus: PublicationStatus) => photosApi.updateStatus(photo.id, { publicationStatus })}
      onDelete={() => photosApi.remove(photo.id)}
    />
  );
}
