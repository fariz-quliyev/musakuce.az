import { apiClient } from "./client";
import type { SearchResponse } from "./types";

export const searchApi = {
  search: (q: string) => apiClient.get<SearchResponse>("/api/search", { q }),
};
