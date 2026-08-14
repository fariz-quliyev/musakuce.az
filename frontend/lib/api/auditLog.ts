import { apiClient } from "./client";
import type { AuditLogEntryDto, AuditLogQuery, PagedResult } from "./types";

/** ADMIN-PRIVILEGED — Administrator only (see Permissions.AuditLogView). */
export const auditLogApi = {
  getPaged: (query: AuditLogQuery = {}) =>
    apiClient.get<PagedResult<AuditLogEntryDto>>("/api/audit-log", query as Record<string, unknown>),
};
