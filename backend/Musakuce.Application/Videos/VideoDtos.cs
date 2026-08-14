using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Videos;

public record VideoDto(
    Guid Id,
    string Title,
    string? Description,
    VideoEmbedProvider EmbedProvider,
    string EmbedUrlOrKey,
    Guid? ThumbnailMediaAssetId,
    string? ThumbnailUrl,
    string? Category,
    DateOnly? RecordedDate,
    SourceStatus SourceStatus,
    PublicationStatus PublicationStatus
);

public class CreateVideoRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public VideoEmbedProvider EmbedProvider { get; set; }
    public required string EmbedUrlOrKey { get; set; }
    /// <summary>Id of a MediaAsset created via POST /api/media/upload —
    /// same pipeline as Photos/People/Places (docs/FINAL_PRE_DEPLOYMENT_AUDIT.md P1-5).
    /// The video itself stays embed-URL-only (EmbedUrlOrKey) — only the
    /// thumbnail is an uploaded image.</summary>
    public Guid? ThumbnailMediaAssetId { get; set; }
    public string? Category { get; set; }
    public DateOnly? RecordedDate { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateVideoRequest : CreateVideoRequest;

public class UpdateVideoStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class VideoQuery : PagedQuery
{
    public PublicationStatus? PublicationStatus { get; set; }
}
