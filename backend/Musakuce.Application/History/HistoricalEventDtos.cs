using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.History;

public record HistoricalEventDto(
    Guid Id,
    string Title,
    string Period,
    DateOnly? EventDate,
    string Description,
    /// <summary>Optional expanded write-up, shown in the timeline's
    /// detail panel below Description when present.</summary>
    string? DetailedText,
    SourceStatus SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? OriginalSourceText,
    int DisplayOrder,
    PublicationStatus PublicationStatus,
    Guid? CoverMediaAssetId,
    string? CoverImageUrl,
    /// <summary>Distinct from PublicationStatus — a Published event can
    /// still be excluded from the curated /kendimiz timeline without
    /// unpublishing it (it stays visible in the full /tariximiz archive).</summary>
    bool ShowInTimeline,
    /// <summary>True only for the sample rows the AddHistoryTimelineFeature
    /// migration seeds — a provenance marker for the admin UI, never used
    /// to filter what's shown publicly.</summary>
    bool IsDefault,
    /// <summary>Admin-picked timeline marker category (see EventIcon doc
    /// comment) — never inferred from Title/Description.</summary>
    EventIcon EventIcon,
    IReadOnlyList<HistoricalEventImageDto> AdditionalImages
);

public record HistoricalEventImageDto(Guid Id, Guid MediaAssetId, string ImageUrl, int SortOrder);

public class CreateHistoricalEventRequest
{
    public required string Title { get; set; }
    public required string Period { get; set; }
    public DateOnly? EventDate { get; set; }
    public required string Description { get; set; }
    public string? DetailedText { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    /// <summary>Free-text citation — e.g. "Ailə arxivi, Səlim baba ilə söhbət, 2020".</summary>
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
    public int DisplayOrder { get; set; }
    public Guid? CoverMediaAssetId { get; set; }
    public bool ShowInTimeline { get; set; } = true;
    public EventIcon EventIcon { get; set; } = EventIcon.General;
    /// <summary>Already-uploaded MediaAsset ids, in display order — the
    /// service replaces the event's whole AdditionalImages collection
    /// with this list on every create/update (same "wholesale replace"
    /// strategy as ClassifiedListing's image list).</summary>
    public List<Guid> AdditionalImageMediaAssetIds { get; set; } = [];
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateHistoricalEventRequest : CreateHistoricalEventRequest;

public class UpdateHistoricalEventStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class HistoricalEventQuery : PagedQuery
{
    public PublicationStatus? PublicationStatus { get; set; }
}
