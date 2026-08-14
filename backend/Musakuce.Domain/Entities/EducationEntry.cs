using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Təhsil" — Phase 13 Part 1. Mirrors MemorialRecord/
/// CulturalHeritageItem's shape: one entity, a Kind enum distinguishes
/// school history / important dates / first school / first teacher /
/// notable teacher / notable graduate / achievement / institution /
/// story. Notable teachers/graduates who already have an İnsanlarımız
/// profile link via RelatedPersonId instead of duplicating biography.</summary>
public class EducationEntry : BaseEntity
{
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public EducationKind Kind { get; set; }
    /// <summary>Free text — many entries are ranges/approximate
    /// ("1928", "1962–1970"), not a single exact date.</summary>
    public string? Period { get; set; }
    public DateOnly? EventDate { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    public Guid? RelatedPersonId { get; set; }
    public Person? RelatedPerson { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? OriginalSourceText { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
