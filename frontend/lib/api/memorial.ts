import { apiClient } from "./client";
import type {
  CreateMemorialRecordRequest,
  MemorialRecordDto,
  MemorialRecordQuery,
  PagedResult,
  PublicationStatus,
  UpdateMemorialRecordRequest,
  UpdateMemorialRecordStatusRequest,
} from "./types";

export const memorialApi = {
  getPaged: (query: MemorialRecordQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<MemorialRecordDto>>("/api/memorial", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<MemorialRecordDto>(`/api/memorial/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreateMemorialRecordRequest) => apiClient.post<MemorialRecordDto>("/api/memorial", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateMemorialRecordRequest) => apiClient.put<MemorialRecordDto>(`/api/memorial/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdateMemorialRecordStatusRequest) =>
    apiClient.patch<MemorialRecordDto>(`/api/memorial/${id}/status`, request),
};
