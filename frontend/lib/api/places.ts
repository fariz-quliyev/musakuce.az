import { apiClient } from "./client";
import type {
  CreatePlaceRequest,
  PagedResult,
  PlaceDto,
  PlaceQuery,
  PublicationStatus,
  UpdatePlaceRequest,
  UpdatePlaceStatusRequest,
} from "./types";

export const placesApi = {
  getPaged: (query: PlaceQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<PlaceDto>>("/api/places", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<PlaceDto>(`/api/places/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED. */
  create: (request: CreatePlaceRequest) => apiClient.post<PlaceDto>("/api/places", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdatePlaceRequest) => apiClient.put<PlaceDto>(`/api/places/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdatePlaceStatusRequest) =>
    apiClient.patch<PlaceDto>(`/api/places/${id}/status`, request),
};
