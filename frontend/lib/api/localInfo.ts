import { apiClient } from "./client";
import type {
  CreateLocalInfoEntryRequest,
  LocalInfoEntryDto,
  LocalInfoQuery,
  PagedResult,
  PublicationStatus,
  UpdateLocalInfoEntryRequest,
  UpdateLocalInfoStatusRequest,
} from "./types";

export const localInfoApi = {
  getPaged: (query: LocalInfoQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<LocalInfoEntryDto>>("/api/local-info", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<LocalInfoEntryDto>(`/api/local-info/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED — staff-only, no public submission form for this directory. */
  create: (request: CreateLocalInfoEntryRequest) =>
    apiClient.post<LocalInfoEntryDto>("/api/local-info", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateLocalInfoEntryRequest) =>
    apiClient.put<LocalInfoEntryDto>(`/api/local-info/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateLocalInfoStatusRequest) =>
    apiClient.patch<LocalInfoEntryDto>(`/api/local-info/${id}/status`, request),
  /** ADMIN-PRIVILEGED — hard delete. */
  remove: (id: string) => apiClient.delete<void>(`/api/local-info/${id}`),
};
