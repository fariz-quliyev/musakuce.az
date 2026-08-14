import { apiClient } from "./client";
import type {
  CreatePersonRequest,
  PagedResult,
  PersonDto,
  PersonQuery,
  PublicationStatus,
  UpdatePersonRequest,
  UpdatePersonStatusRequest,
} from "./types";

export const peopleApi = {
  getPaged: (query: PersonQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<PersonDto>>("/api/people", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<PersonDto>(`/api/people/${id}`, publicationStatus ? { publicationStatus } : undefined),
  /** ADMIN-PRIVILEGED — no public account functionality. */
  create: (request: CreatePersonRequest) => apiClient.post<PersonDto>("/api/people", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdatePersonRequest) => apiClient.put<PersonDto>(`/api/people/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (id: string, request: UpdatePersonStatusRequest) =>
    apiClient.patch<PersonDto>(`/api/people/${id}/status`, request),
};
