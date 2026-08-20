"use client";

import { PublicationStatusActionsWithDelete } from "@/components/admin/shared/PublicationStatusActionsWithDelete";
import { interviewsApi } from "@/lib/api/interviews";
import type { InterviewDto, PublicationStatus } from "@/lib/api/types";

export function InterviewRowActions({ interview }: { interview: InterviewDto }) {
  return (
    <PublicationStatusActionsWithDelete
      status={interview.publicationStatus}
      title={interview.title ?? interview.personName}
      onChangeStatus={(publicationStatus: PublicationStatus) => interviewsApi.updateStatus(interview.id, { publicationStatus })}
      onDelete={() => interviewsApi.remove(interview.id)}
    />
  );
}
