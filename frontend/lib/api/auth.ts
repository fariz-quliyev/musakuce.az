import { apiClient } from "./client";
import type { CurrentUserDto, LoginRequest, LoginResponse } from "./types";

export const authApi = {
  login: (request: LoginRequest) => apiClient.post<LoginResponse>("/api/auth/login", request),
  logout: () => apiClient.post<void>("/api/auth/logout"),
  me: () => apiClient.get<CurrentUserDto>("/api/auth/me"),
};
