"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { videosApi } from "@/lib/api/videos";
import type { PublicationStatus, VideoDto } from "@/lib/api/types";

export function VideoRowActions({ video }: { video: VideoDto }) {
  return (
    <PublicationStatusActions
      status={video.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        videosApi.updateStatus(video.id, { publicationStatus })
      }
    />
  );
}
