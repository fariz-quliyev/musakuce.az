"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { videosApi } from "@/lib/api/videos";
import type { PublicationStatus, VideoDto } from "@/lib/api/types";

export function VideoRowActions({ video }: { video: VideoDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={video.publicationStatus}
      title={video.title}
      onChangeStatus={(publicationStatus: PublicationStatus) => videosApi.updateStatus(video.id, { publicationStatus })}
      onDelete={() => videosApi.remove(video.id)}
    />
  );
}
