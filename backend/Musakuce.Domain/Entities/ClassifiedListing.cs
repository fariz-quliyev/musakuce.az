using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Kəndin elanlar taxtası" — spec §10.</summary>
public class ClassifiedListing : BaseEntity
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public ClassifiedCategory Category { get; set; }
    public decimal? Price { get; set; }
    public required string Location { get; set; }
    public required string ContactName { get; set; }
    public required string ContactInfo { get; set; }
    public ListingStatus ListingStatus { get; set; } = ListingStatus.Active;
    public ModerationStatus ModerationStatus { get; set; } = ModerationStatus.Pending;
    /// <summary>Set by an admin/editor when ModerationStatus is Rejected,
    /// so the submitter's reason for rejection is recorded.</summary>
    public string? RejectionReason { get; set; }
    public DateTimeOffset PostedAt { get; set; } = DateTimeOffset.UtcNow;
    /// <summary>Default 30-day window from posting, spec §10.</summary>
    public DateTimeOffset ExpiresAt { get; set; } = DateTimeOffset.UtcNow.AddDays(30);

    public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
}

/// <summary>Join table — a listing can carry several photos.</summary>
public class ListingImage : BaseEntity
{
    public Guid ClassifiedListingId { get; set; }
    public ClassifiedListing? ClassifiedListing { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
    public int SortOrder { get; set; }
}
