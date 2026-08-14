namespace Musakuce.Domain.Enums;

/// <summary>
/// Moderation state for anonymously-submitted content (classifieds,
/// events, community submissions). Nothing skips Pending.
/// </summary>
public enum ModerationStatus
{
    Pending,
    Approved,
    Rejected,
}

/// <summary>
/// Editorial visibility for staff-authored archive content (Person,
/// HistoricalEvent, Photo, Video, Place, LocalInfoEntry). Distinct from
/// ModerationStatus, which applies to anonymous submissions instead.
/// </summary>
public enum PublicationStatus
{
    Draft,
    Published,
    Archived,
}

/// <summary>
/// Lifecycle of a classified listing once approved — separate from
/// ModerationStatus, which only governs whether it's visible at all.
/// </summary>
public enum ListingStatus
{
    Active,
    Fulfilled,
    Expired,
    Removed,
}

public enum SubmissionStatus
{
    Pending,
    Approved,
    Rejected,
    /// <summary>Approved and already turned into a real content record
    /// (Photo/Video/HistoricalEvent/etc.) by an Archivist/Editor.</summary>
    Converted,
    /// <summary>Reviewed and closed without becoming content or being
    /// rejected outright (e.g. a duplicate) — no longer needs attention.</summary>
    Archived,
}
