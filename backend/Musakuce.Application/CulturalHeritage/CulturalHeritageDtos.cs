using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.CulturalHeritage;

public record CulturalHeritageItemDto(
    Guid Id,
    string Title,
    CulturalHeritageKind Kind,
    string Description,
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
    PublicationStatus PublicationStatus
);

public class CreateCulturalHeritageItemRequest
{
    public required string Title { get; set; }
    public CulturalHeritageKind Kind { get; set; }
    public required string Description { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateCulturalHeritageItemRequest : CreateCulturalHeritageItemRequest;

public class UpdateCulturalHeritageItemStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class CulturalHeritageItemQuery : PagedQuery
{
    public CulturalHeritageKind? Kind { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
