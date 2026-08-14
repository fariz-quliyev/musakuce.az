using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Interviews;

public record InterviewDto(
    Guid Id,
    string PersonName,
    Guid? RelatedPersonId,
    string? Title,
    string? Description,
    string? Transcript,
    VideoEmbedProvider EmbedProvider,
    string EmbedUrlOrKey,
    Guid? ThumbnailMediaAssetId,
    string? ThumbnailImageUrl,
    DateOnly? RecordingDate,
    SourceStatus SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? OriginalSourceText,
    PublicationStatus PublicationStatus
);

public class CreateInterviewRequest
{
    public required string PersonName { get; set; }
    public Guid? RelatedPersonId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Transcript { get; set; }
    public VideoEmbedProvider EmbedProvider { get; set; }
    public required string EmbedUrlOrKey { get; set; }
    public Guid? ThumbnailMediaAssetId { get; set; }
    public DateOnly? RecordingDate { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateInterviewRequest : CreateInterviewRequest;

public class UpdateInterviewStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class InterviewQuery : PagedQuery
{
    public PublicationStatus? PublicationStatus { get; set; }
}
