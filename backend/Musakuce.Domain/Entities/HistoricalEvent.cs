using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Kəndimizin tarixi" timeline — spec §14.</summary>
public class HistoricalEvent : BaseEntity
{
    public required string Title { get; set; }
    /// <summary>Free text — many entries are ranges/approximate
    /// ("1200–1210"), not a single exact date.</summary>
    public required string Period { get; set; }
    /// <summary>Optional exact date, only when known, used for sorting
    /// alongside DisplayOrder.</summary>
    public DateOnly? EventDate { get; set; }
    public required string Description { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    /// <summary>Free-text citation — e.g. "Ailə arxivi, Səlim baba ilə
    /// söhbət, 2020". Distinct from SourceStatus (the category of
    /// evidence) — this is the actual reference itself.</summary>
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller
    /// (Phase 12 §7). Editor's working note about this record, e.g. a
    /// flag to double-check a date before publishing.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.
    /// The original, unedited wording of the source material, preserved
    /// for reference even after the public-facing text is cleaned up.</summary>
    public string? OriginalSourceText { get; set; }
    public int DisplayOrder { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
