namespace Musakuce.Domain.Common;

/// <summary>
/// Shared audit fields for every entity. Ids are server-generated GUIDs
/// so anonymous submissions never leak sequential-id information.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
