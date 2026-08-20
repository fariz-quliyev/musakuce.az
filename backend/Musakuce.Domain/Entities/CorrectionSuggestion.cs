using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// A reader-submitted proposal to correct or expand an already-existing
/// content record (any of the 10 public content types), or to attach a
/// topic-related photo to one. Always anonymous-writable and always
/// enters Pending — a reader can never change the target record
/// directly. On review, an Editor/Archivist/Moderator (Permissions.
/// CorrectionsModerate) marks it Approved or Rejected; approval does not
/// itself mutate the target entity — the reviewer applies the change
/// manually via that content type's own existing admin form (mirrors
/// CommunitySubmission's Pending→Converted precedent, which also
/// requires a manual conversion step rather than an automatic apply).
/// </summary>
public class CorrectionSuggestion : BaseEntity
{
    /// <summary>One of CorrectionTargetTypes.All — which content type the
    /// suggestion is about. A string discriminator (not a shared FK)
    /// because the 10 target tables have nothing in common to join
    /// against generically.</summary>
    public required string TargetEntityType { get; set; }
    public Guid TargetEntityId { get; set; }
    /// <summary>Denormalized at submit time so the admin list/detail view
    /// can show what the suggestion is about even if the target record is
    /// later renamed, unpublished, or deleted.</summary>
    public required string TargetTitle { get; set; }

    /// <summary>Free text: which part of the existing content the reader
    /// believes is wrong or incomplete. Optional — a photo-only
    /// suggestion may leave this blank.</summary>
    public string? FieldOrSection { get; set; }
    /// <summary>The reader's proposed correction or additional
    /// information.</summary>
    public string? SuggestedChange { get; set; }
    public string? AdditionalNotes { get; set; }

    public Guid? PhotoMediaAssetId { get; set; }
    public MediaAsset? PhotoMediaAsset { get; set; }

    public string? SubmitterName { get; set; }
    public string? ContactInfo { get; set; }

    public ModerationStatus Status { get; set; } = ModerationStatus.Pending;
    public string? ReviewerNote { get; set; }
}

/// <summary>The fixed set of public content types a correction suggestion
/// can target — shared between the request validator (must be one of
/// these) and the service (used to look up the target's existence and
/// current title). Kept in the Domain layer since both Application-layer
/// validators and services need it.</summary>
public static class CorrectionTargetTypes
{
    public const string Person = "Person";
    public const string HistoricalEvent = "HistoricalEvent";
    public const string EducationEntry = "EducationEntry";
    public const string MemorialRecord = "MemorialRecord";
    public const string CulturalHeritageItem = "CulturalHeritageItem";
    public const string Interview = "Interview";
    public const string Place = "Place";
    public const string LocalInfoEntry = "LocalInfoEntry";
    public const string Photo = "Photo";
    public const string Video = "Video";

    public static readonly IReadOnlyList<string> All =
    [
        Person, HistoricalEvent, EducationEntry, MemorialRecord, CulturalHeritageItem,
        Interview, Place, LocalInfoEntry, Photo, Video,
    ];
}
