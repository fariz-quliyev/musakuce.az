using Musakuce.Application.Common;

namespace Musakuce.Application.Audit;

public record AuditLogEntryDto(
    Guid Id,
    DateTimeOffset Timestamp,
    Guid? ActorUserId,
    string? ActorEmail,
    string? ActorDisplayName,
    string Action,
    string? EntityType,
    string? EntityId,
    string? OldValue,
    string? NewValue,
    string? IpAddress,
    string? UserAgent
);

/// <summary>ADMIN-PRIVILEGED — Administrator only (see Permissions.AuditLogView).</summary>
public class AuditLogQuery : PagedQuery
{
    public Guid? ActorUserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
}
