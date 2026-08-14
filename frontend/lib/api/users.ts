import { apiClient } from "./client";
import type { AdminUserDto, AssignRoleRequest, CreateUserRequest, ResetPasswordRequest, SetActiveRequest } from "./types";

/** ADMIN-PRIVILEGED — Administrator only (see Permissions.UsersManage). */
export const usersApi = {
  getAll: () => apiClient.get<AdminUserDto[]>("/api/users"),
  create: (request: CreateUserRequest) => apiClient.post<AdminUserDto>("/api/users", request),
  setActive: (id: string, request: SetActiveRequest) =>
    apiClient.patch<AdminUserDto>(`/api/users/${id}/active`, request),
  assignRole: (id: string, request: AssignRoleRequest) =>
    apiClient.patch<AdminUserDto>(`/api/users/${id}/role`, request),
  resetPassword: (id: string, request: ResetPasswordRequest) =>
    apiClient.post<void>(`/api/users/${id}/reset-password`, request),
};
