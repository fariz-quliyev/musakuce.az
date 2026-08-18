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
    /// <summary>Short blurb — shown on timeline cards and as the lead
    /// line of the full write-up.</summary>
    public required string Description { get; set; }
    /// <summary>Optional expanded write-up, shown only in the timeline's
    /// detail panel below Description when present.</summary>
    public string? DetailedText { get; set; }
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
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    /// <summary>Distinct from PublicationStatus: a Published event can
    /// still be excluded from the curated /kendimiz timeline (e.g. kept
    /// in the full /tariximiz archive but temporarily unfeatured) without
    /// unpublishing it.</summary>
    public bool ShowInTimeline { get; set; } = true;
    /// <summary>True only for the placeholder rows the AddHistoryTimelineFeature
    /// migration seeds so the timeline isn't empty on first load. Never
    /// used to filter what's shown — purely a provenance marker so the
    /// admin UI can flag "this is sample content, review/replace it."</summary>
    public bool IsDefault { get; set; }
    /// <summary>Admin-picked timeline marker category — see EventIcon doc
    /// comment for why this isn't inferred from Title/Description text.</summary>
    public EventIcon EventIcon { get; set; } = EventIcon.General;
    public ICollection<HistoricalEventImage> AdditionalImages { get; set; } = new List<HistoricalEventImage>();
}

/// <summary>Join table — a historical event can carry a few supporting
/// photos/documents beyond its single CoverMediaAsset.</summary>
public class HistoricalEventImage : BaseEntity
{
    public Guid HistoricalEventId { get; set; }
    public HistoricalEvent? HistoricalEvent { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
    public int SortOrder { get; set; }
}
