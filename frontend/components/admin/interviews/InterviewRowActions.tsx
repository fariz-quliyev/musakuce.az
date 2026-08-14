"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewDto, PublicationStatus } from "@/lib/api/types";

export function InterviewRowActions({ interview }: { interview: InterviewDto }) {
  return (
    <PublicationStatusActions
      status={interview.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) => interviewsApi.updateStatus(interview.id, { publicationStatus })}
    />
  );
}
