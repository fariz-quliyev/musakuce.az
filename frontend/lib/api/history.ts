import { apiClient } from "./client";
import type {
  CreateHistoricalEventRequest,
  HistoricalEventDto,
  HistoricalEventQuery,
  PagedResult,
  PublicationStatus,
  UpdateHistoricalEventRequest,
  UpdateHistoricalEventStatusRequest,
} from "./types";

export const historyApi = {
  getPaged: (query: HistoricalEventQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<HistoricalEventDto>>("/api/history", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<HistoricalEventDto>(`/api/history/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreateHistoricalEventRequest) =>
    apiClient.post<HistoricalEventDto>("/api/history", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateHistoricalEventRequest) =>
    apiClient.put<HistoricalEventDto>(`/api/history/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateHistoricalEventStatusRequest) =>
    apiClient.patch<HistoricalEventDto>(`/api/history/${id}/status`, request),
  /** ADMIN-PRIVILEGED — hard delete. */
  remove: (id: string) => apiClient.delete<void>(`/api/history/${id}`),
};
