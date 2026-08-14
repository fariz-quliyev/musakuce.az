import { apiClient } from "./client";
import type {
  CreateEventRequest,
  EventDto,
  EventQuery,
  PagedResult,
  PublicationStatus,
  UpdateEventRequest,
  UpdateEventStatusRequest,
} from "./types";

export const eventsApi = {
  getPaged: (query: EventQuery = {}, revalidate?: number) =>
    apiClient.get<PagedResult<EventDto>>("/api/events", query as Record<string, unknown>, revalidate),
  getById: (id: string, publicationStatus?: PublicationStatus) =>
    apiClient.get<EventDto>(`/api/events/${id}`, publicationStatus ? { publicationStatus } : undefined),
  create: (request: CreateEventRequest) => apiClient.post<EventDto>("/api/events", request),
  /** ADMIN-PRIVILEGED — full field edit. */
  update: (id: string, request: UpdateEventRequest) => apiClient.put<EventDto>(`/api/events/${id}`, request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive ("delete" is modeled as Archived). */
  updateStatus: (id: string, request: UpdateEventStatusRequest) =>
    apiClient.patch<EventDto>(`/api/events/${id}/status`, request),
};
