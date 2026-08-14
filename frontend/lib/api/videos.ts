import { apiClient } from "./client";
import type {
  CreateVideoRequest,
  PagedResult,
  PublicationStatus,
  UpdateVideoRequest,
  UpdateVideoStatusRequest,
  VideoDto,
  VideoQuery,
} from "./types";

export const videosApi = {
  getPaged: (query: VideoQuery = {}) =>
    apiClient.get<PagedResult<VideoDto>>("/api/videos", query as Record<string, unknown>),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<VideoDto>(`/api/videos/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED — no upload, embedded URLs only. */
  create: (request: CreateVideoRequest) => apiClient.post<VideoDto>("/api/videos", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateVideoRequest) => apiClient.put<VideoDto>(`/api/videos/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateVideoStatusRequest) =>
    apiClient.patch<VideoDto>(`/api/videos/${id}/status`, request),
};
