using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// "Kəndimiz" village-level settings — Phase 12 §2. Deliberately a
/// singleton: the public homepage/Kəndimiz page always reads the one
/// Published row (falling back to mock content if none exists yet, same
/// as every other content type); admins edit a Draft copy and publish it
/// when ready, using the same PublicationStatus workflow as everything
/// else rather than inventing a separate "settings" concept.
/// </summary>
public class VillageProfile : BaseEntity
{
    public required string VillageName { get; set; }
    /// <summary>Short eyebrow/tagline, e.g. "Musaküçə — bizim kənd".</summary>
    public string? Tagline { get; set; }
    /// <summary>One to two sentences — used on the homepage hero/cards.</summary>
    public required string ShortDescription { get; set; }
    /// <summary>Full "Kəndimiz haqqında" narrative.</summary>
    public string? LongDescription { get; set; }
    public int? Population { get; set; }
    /// <summary>Population figures go stale — the year they were true,
    /// so the public site can be honest about how current the number is.</summary>
    public int? PopulationAsOfYear { get; set; }
    public decimal? AreaHectares { get; set; }
    public string? GeographicalDescription { get; set; }
    public string? MainOccupations { get; set; }
    public string? NeighboringSettlements { get; set; }
    /// <summary>The village name-origin story — almost always oral
    /// tradition, never presented as established fact (Phase 12 rule).</summary>
    public string? NameOriginNarrative { get; set; }
    public SourceStatus? NameOriginSourceStatus { get; set; }
    public string? NameOriginSourceReference { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public Guid? HeroMediaAssetId { get; set; }
    public MediaAsset? HeroMediaAsset { get; set; }
    public Guid? LogoMediaAssetId { get; set; }
    public MediaAsset? LogoMediaAsset { get; set; }
    public string? ContactInfo { get; set; }
    public string? SocialLinks { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? EditorialNote { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
