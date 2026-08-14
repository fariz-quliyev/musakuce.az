using Musakuce.Application.Common;

namespace Musakuce.Application.Audit;

public interface IAuditLogService
{
    /// <summary>
    /// Records one audit entry using the current request's actor
    /// (via ICurrentActorContext) — never throws; a logging failure must
    /// not break the underlying admin action.
    /// </summary>
    Task LogAsync(
        string action,
        string? entityType = null,
        string? entityId = null,
        string? oldValue = null,
        string? newValue = null,
        CancellationToken ct = default);

    /// <summary>ADMIN-PRIVILEGED — Administrator only.</summary>
    Task<PagedResult<AuditLogEntryDto>> GetPagedAsync(AuditLogQuery query, CancellationToken ct = default);
}
