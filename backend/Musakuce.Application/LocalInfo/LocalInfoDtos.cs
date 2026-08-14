using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.LocalInfo;

public record LocalInfoEntryDto(
    Guid Id,
    string Name,
    LocalInfoKind Kind,
    string Category,
    string? Description,
    string? ContactInfo,
    string? AreaServed,
    string? PhotoUrl,
    Guid? AttachedToEntryId,
    PublicationStatus PublicationStatus
);

/// <summary>Staff-only — spec §11 has no public submission endpoint for
/// this directory; suggestions arrive via CommunitySubmission instead.</summary>
public class CreateLocalInfoEntryRequest
{
    public required string Name { get; set; }
    public LocalInfoKind Kind { get; set; }
    public required string Category { get; set; }
    public string? Description { get; set; }
    public string? ContactInfo { get; set; }
    public string? AreaServed { get; set; }
    public string? PhotoUrl { get; set; }
    public Guid? AttachedToEntryId { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateLocalInfoEntryRequest : CreateLocalInfoEntryRequest;

public class UpdateLocalInfoStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class LocalInfoQuery : PagedQuery
{
    public LocalInfoKind? Kind { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
