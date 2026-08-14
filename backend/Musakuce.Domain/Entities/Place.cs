using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// Unifies HistoricalPlace and "useful place" (spec §5): one table, one
/// map layer, one detail-page template. Kind selects which fields apply.
/// </summary>
public class Place : BaseEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public PlaceKind Kind { get; set; }
    public PlaceCategory? Category { get; set; }
    public string? Description { get; set; }
    /// <summary>Only meaningful when Kind is Historical.</summary>
    public string? HistoricalBackground { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    /// <summary>Only meaningful when Kind is Historical.</summary>
    public SourceStatus? SourceStatus { get; set; }
    /// <summary>Free-text citation, e.g. "Ailə arxivi, Səlim baba ilə
    /// söhbət, 2020" — same convention as HistoricalEvent.SourceReference.</summary>
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller
    /// (Phase 12 §7).</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? OriginalSourceText { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
