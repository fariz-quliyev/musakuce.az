using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>"Kəndimizin səsi" — Phase 12 §G. Mirrors Video's embed model
/// (same VideoEmbedProvider — SelfHosted also covers audio-only
/// recordings uploaded as a MediaAsset) plus an optional transcript and
/// a link to the interviewee's own "İnsanlarımız" profile if they have
/// one.</summary>
public class Interview : BaseEntity
{
    public required string PersonName { get; set; }
    public Guid? RelatedPersonId { get; set; }
    public Person? RelatedPerson { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Transcript { get; set; }
    public VideoEmbedProvider EmbedProvider { get; set; }
    public required string EmbedUrlOrKey { get; set; }
    public Guid? ThumbnailMediaAssetId { get; set; }
    public MediaAsset? ThumbnailMediaAsset { get; set; }
    public DateOnly? RecordingDate { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY — never serialized to an unprivileged caller.</summary>
    public string? OriginalSourceText { get; set; }
    public PublicationStatus PublicationStatus { get; set; } = PublicationStatus.Draft;
}
