import { apiClient } from "./client";
import type {
  CorrectionSuggestionDto,
  CorrectionSuggestionQuery,
  CreateCorrectionSuggestionRequest,
  PagedResult,
  UpdateCorrectionSuggestionStatusRequest,
} from "./types";

export const correctionsApi = {
  create: (request: CreateCorrectionSuggestionRequest) =>
    apiClient.post<CorrectionSuggestionDto>("/api/corrections", request),
  /** ADMIN-PRIVILEGED — the moderation inbox listing, incl. contact info. */
  getPaged: (query: CorrectionSuggestionQuery = {}) =>
    apiClient.get<PagedResult<CorrectionSuggestionDto>>("/api/corrections", query as Record<string, unknown>),
  /** ADMIN-PRIVILEGED — exposes submitter contact info. */
  getById: (id: string) => apiClient.get<CorrectionSuggestionDto>(`/api/corrections/${id}`),
  /** ADMIN-PRIVILEGED — approve/reject. */
  updateStatus: (id: string, request: UpdateCorrectionSuggestionStatusRequest) =>
    apiClient.patch<CorrectionSuggestionDto>(`/api/corrections/${id}/status`, request),
};
