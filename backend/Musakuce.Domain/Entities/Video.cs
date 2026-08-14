using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Videolar" — spec §16. Archive, not a feed.</summary>
public class Video : BaseEntity
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public VideoEmbedProvider EmbedProvider { get; set; }
    /// <summary>YouTube/Vimeo id or embed URL, or an R2 storage key when
    /// SelfHosted (Phase 8).</summary>
    public required string EmbedUrlOrKey { get; set; }
    public Guid? ThumbnailMediaAssetId { get; set; }
    public MediaAsset? ThumbnailMediaAsset { get; set; }
    /// <summary>Free-text category (spec has no fixed video-category
    /// enum) — e.g. "Kənd panoramı", "Müsahibə".</summary>
    public string? Category { get; set; }
    /// <summary>What the footage is of/from — distinct from CreatedAt
    /// (the upload/record audit timestamp).</summary>
    public DateOnly? RecordedDate { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
