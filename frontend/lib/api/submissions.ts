import { apiClient } from "./client";
import type {
  CreateSubmissionRequest,
  PagedResult,
  SubmissionDto,
  SubmissionQuery,
  UpdateSubmissionStatusRequest,
} from "./types";

export const submissionsApi = {
  create: (request: CreateSubmissionRequest) => apiClient.post<SubmissionDto>("/api/submissions", request),
  /** ADMIN-PRIVILEGED — the moderation inbox listing, incl. contact info. */
  getPaged: (query: SubmissionQuery = {}) =>
    apiClient.get<PagedResult<SubmissionDto>>("/api/submissions", query as Record<string, unknown>),
  /** ADMIN-PRIVILEGED — exposes submitter contact info. */
  getById: (id: string) => apiClient.get<SubmissionDto>(`/api/submissions/${id}`),
  /** ADMIN-PRIVILEGED — approve/reject/archive. */
  updateStatus: (id: string, request: UpdateSubmissionStatusRequest) =>
    apiClient.patch<SubmissionDto>(`/api/submissions/${id}/status`, request),
};
