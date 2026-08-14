using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Places;

public record PlaceDto(
    Guid Id,
    string Name,
    string Slug,
    PlaceKind Kind,
    PlaceCategory? Category,
    string? Description,
    string? HistoricalBackground,
    decimal Latitude,
    decimal Longitude,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    SourceStatus? SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? OriginalSourceText,
    PublicationStatus PublicationStatus,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public class CreatePlaceRequest
{
    public required string Name { get; set; }
    public PlaceKind Kind { get; set; }
    public PlaceCategory? Category { get; set; }
    public string? Description { get; set; }
    public string? HistoricalBackground { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    /// <summary>Id of a MediaAsset created via POST /api/media/upload —
    /// same pipeline as Photos. Optional: not every Place has a photo yet.</summary>
    public Guid? CoverMediaAssetId { get; set; }
    public SourceStatus? SourceStatus { get; set; }
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdatePlaceRequest : CreatePlaceRequest;

public class UpdatePlaceStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class PlaceQuery : PagedQuery
{
    public PlaceKind? Kind { get; set; }
    public PlaceCategory? Category { get; set; }
    public PublicationStatus? PublicationStatus { get; set; }
}
