using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"İnsanlarımız" — spec §15.</summary>
public class Person : BaseEntity
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? FatherName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }
    public PersonCategory Category { get; set; }
    public string? Occupation { get; set; }
    public required string Biography { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public MediaAsset? CoverMediaAsset { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller
    /// (Phase 12 §7).</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? OriginalSourceText { get; set; }
    public required string Slug { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
    public ICollection<PersonImage> AdditionalImages { get; set; } = new List<PersonImage>();
}

/// <summary>Join table — a person can carry a few supporting photos beyond
/// their single CoverMediaAsset (the "Fotoalbom" section).</summary>
public class PersonImage : BaseEntity
{
    public Guid PersonId { get; set; }
    public Person? Person { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
    public int SortOrder { get; set; }
}
