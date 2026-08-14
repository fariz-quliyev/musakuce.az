import { apiClient } from "./client";
import type { PublicationStatus, UpdateVillageProfileStatusRequest, UpsertVillageProfileRequest, VillageProfileDto } from "./types";

export const villageProfileApi = {
  get: (publicationStatus?: PublicationStatus, revalidate?: number) =>
    apiClient.get<VillageProfileDto>("/api/village-profile", publicationStatus ? { publicationStatus } : undefined, revalidate),
  /** ADMIN-PRIVILEGED — upserts the single row. */
  upsert: (request: UpsertVillageProfileRequest) => apiClient.put<VillageProfileDto>("/api/village-profile", request),
  /** ADMIN-PRIVILEGED — publish/unpublish/archive. */
  updateStatus: (request: UpdateVillageProfileStatusRequest) =>
    apiClient.patch<VillageProfileDto>("/api/village-profile/status", request),
};
