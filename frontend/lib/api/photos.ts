import { apiClient } from "./client";
import type {
  CreatePhotoRequest,
  PagedResult,
  PhotoDto,
  PhotoQuery,
  PublicationStatus,
  UpdatePhotoRequest,
  UpdatePhotoStatusRequest,
} from "./types";

export const photosApi = {
  getPaged: (query: PhotoQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<PhotoDto>>("/api/photos", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<PhotoDto>(`/api/photos/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED — no upload, URL-based only. */
  create: (request: CreatePhotoRequest) => apiClient.post<PhotoDto>("/api/photos", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdatePhotoRequest) => apiClient.put<PhotoDto>(`/api/photos/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdatePhotoStatusRequest) =>
    apiClient.patch<PhotoDto>(`/api/photos/${id}/status`, request),
};
