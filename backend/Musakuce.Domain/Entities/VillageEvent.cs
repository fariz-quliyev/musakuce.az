using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Kənd təqvimi" / "Bu həftə kənddə" — spec §12.</summary>
public class VillageEvent : BaseEntity
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public EventCategory Category { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public required string Location { get; set; }
    public Guid? PlaceId { get; set; }
    public Place? Place { get; set; }
    public string? OrganizerName { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
