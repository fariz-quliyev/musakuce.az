namespace Musakuce.Domain.Entities;

/// <summary>
/// Immutable record of a privileged admin action — Phase 7 requirement.
/// Not a BaseEntity (no meaningful UpdatedAt for an append-only log).
/// ActorEmail/ActorDisplayName are denormalized so the log stays
/// readable even if the acting user is later deleted.
/// </summary>
public class AuditLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public Guid? ActorUserId { get; set; }
    public string? ActorEmail { get; set; }
    public string? ActorDisplayName { get; set; }

    /// <summary>e.g. "Login", "LoginFailed", "Create", "Update", "Publish",
    /// "Approve", "Reject", "Archive", "RoleChange", "UserCreated",
    /// "UserDisabled", "UserEnabled", "PasswordReset".</summary>
    public required string Action { get; set; }

    /// <summary>e.g. "ClassifiedListing", "Person", "ApplicationUser" — null for account-level events like Login.</summary>
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }

    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
