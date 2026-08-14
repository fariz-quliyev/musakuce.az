import { apiClient } from "./client";
import type {
  CreateListingRequest,
  ListingDto,
  ListingQuery,
  ModerationStatus,
  PagedResult,
  UpdateListingRequest,
  UpdateListingStatusRequest,
} from "./types";

export const listingsApi = {
  getPaged: (query: ListingQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<ListingDto>>("/api/listings", query as Record<string, unknown>, revalidate),
  getById: (id: string, moderationStatus?: ModerationStatus) =>
    apiClient.get<ListingDto>(`/api/listings/${id}`, moderationStatus ? { moderationStatus } : undefined),
  create: (request: CreateListingRequest) => apiClient.post<ListingDto>("/api/listings", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateListingRequest) => apiClient.put<ListingDto>(`/api/listings/${id}`, request),
  /** ADMIN-PRIVILEGED — approve/reject(+reason)/mark sold-closed. */
  updateStatus: (id: string, request: UpdateListingStatusRequest) =>
    apiClient.patch<ListingDto>(`/api/listings/${id}/status`, request),
};
