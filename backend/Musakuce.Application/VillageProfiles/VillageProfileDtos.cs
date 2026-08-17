using Musakuce.Domain.Enums;

namespace Musakuce.Application.VillageProfiles;

public record VillageProfileDto(
    Guid Id,
    string VillageName,
    string? Tagline,
    string ShortDescription,
    string? LongDescription,
    int? Population,
    int? PopulationAsOfYear,
    decimal? AreaHectares,
    string? GeographicalDescription,
    string? MainOccupations,
    string? NeighboringSettlements,
    string? NameOriginNarrative,
    SourceStatus? NameOriginSourceStatus,
    string? NameOriginSourceReference,
    decimal? Latitude,
    decimal? Longitude,
    Guid? HeroMediaAssetId,
    string? HeroImageUrl,
    string? CtaText,
    string? CtaLink,
    Guid? LogoMediaAssetId,
    string? LogoImageUrl,
    string? ContactInfo,
    string? SocialLinks,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    PublicationStatus PublicationStatus,
    DateTimeOffset UpdatedAt
);

/// <summary>ADMIN-PRIVILEGED — always upserts the single village-profile
/// row; there is no separate Create.</summary>
public class UpsertVillageProfileRequest
{
    public required string VillageName { get; set; }
    public string? Tagline { get; set; }
    public required string ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public int? Population { get; set; }
    public int? PopulationAsOfYear { get; set; }
    public decimal? AreaHectares { get; set; }
    public string? GeographicalDescription { get; set; }
    public string? MainOccupations { get; set; }
    public string? NeighboringSettlements { get; set; }
    public string? NameOriginNarrative { get; set; }
    public SourceStatus? NameOriginSourceStatus { get; set; }
    public string? NameOriginSourceReference { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public Guid? HeroMediaAssetId { get; set; }
    public string? CtaText { get; set; }
    public string? CtaLink { get; set; }
    public Guid? LogoMediaAssetId { get; set; }
    public string? ContactInfo { get; set; }
    public string? SocialLinks { get; set; }
    public string? EditorialNote { get; set; }
}

public class UpdateVillageProfileStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}
