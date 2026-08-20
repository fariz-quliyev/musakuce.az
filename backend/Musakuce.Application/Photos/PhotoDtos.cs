using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Photos;

public record PhotoDto(
    Guid Id,
    string Title,
    DateOnly? TakenDate,
    string? Location,
    string? Description,
    string? Story,
    PhotoCategory Category,
    SourceStatus SourceStatus,
    string? UploaderName,
    Guid MediaAssetId,
    string ImageUrl,
    string? AltText,
    Guid? RestoredMediaAssetId,
    string? RestoredImageUrl,
    PublicationStatus PublicationStatus
);

public class CreatePhotoRequest
{
    public required string Title { get; set; }
    public DateOnly? TakenDate { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? Story { get; set; }
    public PhotoCategory Category { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? UploaderName { get; set; }
    /// <summary>Id of a MediaAsset created via POST /api/media/upload —
    /// Phase 8 replaces free-text image URLs with a real upload pipeline.</summary>
    public required Guid MediaAssetId { get; set; }
    public string? AltText { get; set; }
    /// <summary>Id of a MediaAsset holding the restored/enhanced version
    /// of the same photo — optional. When set, the public lightbox shows
    /// a Before/After comparison slider instead of the plain image.</summary>
    public Guid? RestoredMediaAssetId { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdatePhotoRequest : CreatePhotoRequest;

public class UpdatePhotoStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class PhotoQuery : PagedQuery
{
    public PhotoCategory? Category { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
