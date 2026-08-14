using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// "Yerli Faydalı Məlumatlar" (spec §11) — the single unified directory
/// replacing separate ServiceProvider/LocalContact/Recommendation
/// designs. Staff-managed; no public submission endpoint (suggestions
/// arrive via CommunitySubmission and are converted manually).
/// </summary>
public class LocalInfoEntry : BaseEntity
{
    public required string Name { get; set; }
    public LocalInfoKind Kind { get; set; }
    public required string Category { get; set; }
    public string? Description { get; set; }
    public string? ContactInfo { get; set; }
    public string? AreaServed { get; set; }
    public Guid? PhotoMediaAssetId { get; set; }
    public MediaAsset? PhotoMediaAsset { get; set; }
    /// <summary>Set when this row is a recommendation attached to an
    /// existing entry rather than standing alone.</summary>
    public Guid? AttachedToEntryId { get; set; }
    public LocalInfoEntry? AttachedToEntry { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
