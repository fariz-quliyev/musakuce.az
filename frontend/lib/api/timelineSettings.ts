import { apiClient } from "./client";
import type { TimelineSettingsDto, UpsertTimelineSettingsRequest } from "./types";

export const timelineSettingsApi = {
  get: (revalidate?: number) => apiClient.get<TimelineSettingsDto>("/api/timeline-settings", undefined, revalidate),
  /** ADMIN-PRIVILEGED — upserts the single row. */
  upsert: (request: UpsertTimelineSettingsRequest) => apiClient.put<TimelineSettingsDto>("/api/timeline-settings", request),
};
