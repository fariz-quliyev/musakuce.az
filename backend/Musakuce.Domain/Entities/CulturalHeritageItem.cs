using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Mədəni irs" — Phase 12 §F.</summary>
public class CulturalHeritageItem : BaseEntity
{
    public required string Title { get; set; }
    public CulturalHeritageKind Kind { get; set; }
    public required string Description { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? OriginalSourceText { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
