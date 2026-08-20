import { apiClient } from "./client";
import type {
  CreateEducationEntryRequest,
  EducationEntryDto,
  EducationEntryQuery,
  PagedResult,
  PublicationStatus,
  UpdateEducationEntryRequest,
  UpdateEducationEntryStatusRequest,
} from "./types";

export const educationApi = {
  getPaged: (query: EducationEntryQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<EducationEntryDto>>("/api/education", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<EducationEntryDto>(`/api/education/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreateEducationEntryRequest) => apiClient.post<EducationEntryDto>("/api/education", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateEducationEntryRequest) => apiClient.put<EducationEntryDto>(`/api/education/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateEducationEntryStatusRequest) =>
    apiClient.patch<EducationEntryDto>(`/api/education/${id}/status`, request),
  /** ADMIN-PRIVILEGED — hard delete. */
  remove: (id: string) => apiClient.delete<void>(`/api/education/${id}`),
};
