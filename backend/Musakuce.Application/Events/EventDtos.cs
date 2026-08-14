using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Events;

public record EventDto(
    Guid Id,
    string Title,
    string Description,
    EventCategory Category,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    string Location,
    Guid? PlaceId,
    string? OrganizerName,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    PublicationStatus PublicationStatus
);

public class CreateEventRequest
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public EventCategory Category { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public required string Location { get; set; }
    public Guid? PlaceId { get; set; }
    public string? OrganizerName { get; set; }
    /// <summary>Id of a MediaAsset created via POST /api/media/upload —
    /// same pipeline as Photos/People/Places (docs/FINAL_PRE_DEPLOYMENT_AUDIT.md P1-5).</summary>
    public Guid? CoverMediaAssetId { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateEventRequest : CreateEventRequest;

/// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
public class UpdateEventStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class EventQuery : PagedQuery
{
    public EventCategory? Category { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
    /// <summary>Only events starting on/after this instant — powers
    /// "Bu həftə kənddə" (upcoming only).</summary>
    public DateTimeOffset? From { get; set; }
    /// <summary>Only events starting on/before this instant — combined
    /// with From to power "Bu gün / Bu həftə / Bu ay" presets.</summary>
    public DateTimeOffset? To { get; set; }
}
