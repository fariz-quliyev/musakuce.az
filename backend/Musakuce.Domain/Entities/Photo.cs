using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// "Bir foto — bir hekayə" — spec §15/§19. Each photo wraps one
/// required MediaAsset plus the storytelling metadata.
/// </summary>
public class Photo : BaseEntity
{
    public required string Title { get; set; }
    public DateOnly? TakenDate { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    /// <summary>The "bir hekayə" narrative text.</summary>
    public string? Story { get; set; }
    public PhotoCategory Category { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? UploaderName { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
