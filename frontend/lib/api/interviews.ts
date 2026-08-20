import { apiClient } from "./client";
import type {
  CreateInterviewRequest,
  InterviewDto,
  InterviewQuery,
  PagedResult,
  PublicationStatus,
  UpdateInterviewRequest,
  UpdateInterviewStatusRequest,
} from "./types";

export const interviewsApi = {
  getPaged: (query: InterviewQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<InterviewDto>>("/api/interviews", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<InterviewDto>(`/api/interviews/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreateInterviewRequest) => apiClient.post<InterviewDto>("/api/interviews", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateInterviewRequest) => apiClient.put<InterviewDto>(`/api/interviews/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateInterviewStatusRequest) =>
    apiClient.patch<InterviewDto>(`/api/interviews/${id}/status`, request),
  /** ADMIN-PRIVILEGED — hard delete. */
  remove: (id: string) => apiClient.delete<void>(`/api/interviews/${id}`),
};
