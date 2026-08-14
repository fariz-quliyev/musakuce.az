using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Memorial;

public record MemorialRecordDto(
    Guid Id,
    string FullName,
    string? FatherName,
    MemorialCategory Category,
    DateOnly? BirthDate,
    DateOnly? DeathDate,
    string? Biography,
    string? Achievements,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    Guid? RelatedPersonId,
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

public class CreateMemorialRecordRequest
{
    public required string FullName { get; set; }
    public string? FatherName { get; set; }
    public MemorialCategory Category { get; set; }
    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }
    public string? Biography { get; set; }
    public string? Achievements { get; set; }
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
public class UpdateMemorialRecordRequest : CreateMemorialRecordRequest;

public class UpdateMemorialRecordStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class MemorialRecordQuery : PagedQuery
{
    public MemorialCategory? Category { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
