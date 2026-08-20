import { apiClient } from "./client";
import type {
  CreateCulturalHeritageItemRequest,
  CulturalHeritageItemDto,
  CulturalHeritageItemQuery,
  PagedResult,
  PublicationStatus,
  UpdateCulturalHeritageItemRequest,
  UpdateCulturalHeritageItemStatusRequest,
} from "./types";

export const culturalHeritageApi = {
  getPaged: (query: CulturalHeritageItemQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<CulturalHeritageItemDto>>("/api/cultural-heritage", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<CulturalHeritageItemDto>(`/api/cultural-heritage/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreateCulturalHeritageItemRequest) => apiClient.post<CulturalHeritageItemDto>("/api/cultural-heritage", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateCulturalHeritageItemRequest) =>
    apiClient.put<CulturalHeritageItemDto>(`/api/cultural-heritage/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateCulturalHeritageItemStatusRequest) =>
    apiClient.patch<CulturalHeritageItemDto>(`/api/cultural-heritage/${id}/status`, request),
  /** ADMIN-PRIVILEGED — hard delete. */
  remove: (id: string) => apiClient.delete<void>(`/api/cultural-heritage/${id}`),
};
