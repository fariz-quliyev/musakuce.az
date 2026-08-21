using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Education;

public record EducationEntryDto(
    Guid Id,
    string Title,
    string Slug,
    string? Summary,
    string? Content,
    EducationKind Kind,
    string? OtherKindLabel,
    string? Period,
    DateOnly? EventDate,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    Guid? RelatedPersonId,
    SourceStatus SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7 pattern) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer — never sent to the public site.</summary>
    string? OriginalSourceText,
    PublicationStatus PublicationStatus
);

public class CreateEducationEntryRequest
{
    public required string Title { get; set; }
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public EducationKind Kind { get; set; }
    public string? OtherKindLabel { get; set; }
    public string? Period { get; set; }
    public DateOnly? EventDate { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public Guid? RelatedPersonId { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateEducationEntryRequest : CreateEducationEntryRequest;

public class UpdateEducationEntryStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class EducationEntryQuery : PagedQuery
{
    public EducationKind? Kind { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
