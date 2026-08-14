using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Xatirə" — Phase 12 §E. One unified table for every
/// memorial category (see MemorialCategory) — mirrors Person's structure
/// closely since these are, editorially, biographical records too.</summary>
public class MemorialRecord : BaseEntity
{
    public required string FullName { get; set; }
    public string? FatherName { get; set; }
    public MemorialCategory Category { get; set; }
    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }
    public string? Biography { get; set; }
    public string? Achievements { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    /// <summary>Optional link when this memorial record is also written
    /// up as a full "İnsanlarımız" profile — avoids duplicating the same
    /// biography in two places (Phase 12 §5).</summary>
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
