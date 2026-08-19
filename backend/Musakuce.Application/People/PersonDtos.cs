using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.People;

public record PersonImageDto(Guid Id, Guid MediaAssetId, string ImageUrl, int SortOrder);

public record PersonDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? FatherName,
    DateOnly? BirthDate,
    DateOnly? DeathDate,
    PersonCategory Category,
    string? Occupation,
    string Biography,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    SourceStatus SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? OriginalSourceText,
    string Slug,
    PublicationStatus PublicationStatus,
    IReadOnlyList<PersonImageDto> AdditionalImages
);

public class CreatePersonRequest
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? FatherName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }
    public PersonCategory Category { get; set; }
    public string? Occupation { get; set; }
    public required string Biography { get; set; }
    /// <summary>Id of a MediaAsset created via POST /api/media/upload —
    /// same pipeline as Photos/Places. Optional: not every person has a
    /// photo yet.</summary>
    public Guid? CoverMediaAssetId { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
    /// <summary>Already-uploaded MediaAsset ids, in display order — the
    /// service replaces the person's whole AdditionalImages collection
    /// with this list on every create/update (same "wholesale replace"
    /// strategy as HistoricalEvent's additional images).</summary>
    public List<Guid> AdditionalImageMediaAssetIds { get; set; } = [];
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdatePersonRequest : CreatePersonRequest;

public class UpdatePersonStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class PersonQuery : PagedQuery
{
    public PersonCategory? Category { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
