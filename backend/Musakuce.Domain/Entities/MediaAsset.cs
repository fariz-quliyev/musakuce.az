using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// A single uploaded/linked media file. Phase 8 adds real object-storage
/// upload; rows created before Phase 8 (or added via an external URL)
/// simply have <see cref="StorageKeyPrefix"/> null — Url alone still
/// works everywhere this entity is used, so nothing about the existing
/// Photo/Video/Person/Event/Listing/LocalInfo/Submission relationships
/// needed to change.
///
/// Title/Description/publication status are deliberately NOT duplicated
/// here — every entity that owns a MediaAsset (Photo, Person, Event...)
/// already carries its own Title/Description/PublicationStatus, and that
/// owning record is what controls public visibility. A MediaAsset row is
/// purely "a file that exists in storage", not "a piece of content".
/// </summary>
public class MediaAsset : BaseEntity
{
    /// <summary>Public URL of the primary web-optimized variant — what
    /// every existing image consumer (Photo, VillagePhoto, etc.) uses.</summary>
    public required string Url { get; set; }

    /// <summary>Small variant for grids/admin lists. Null for
    /// non-image media or pre-Phase-8 URL-only rows.</summary>
    public string? ThumbnailUrl { get; set; }

    /// <summary>Full-quality archival original — spec Phase 8 §6/§15:
    /// the resized public variant must never be the only copy kept.</summary>
    public string? OriginalUrl { get; set; }

    /// <summary>Object storage key PREFIX shared by this asset's
    /// variants (e.g. "photos/2026/08/{guid}"; actual objects are
    /// "{prefix}/original", "{prefix}/display", "{prefix}/thumb").
    /// Null for rows that only ever had an external URL (no managed
    /// storage object to delete/replace).</summary>
    public string? StorageKeyPrefix { get; set; }

    /// <summary>Full object key for the original variant, incl.
    /// extension — kept explicitly (rather than derived from
    /// OriginalFileName) because the stored extension reflects the
    /// actual decoded image format, which can differ from whatever
    /// extension the uploader's filename happened to use.</summary>
    public string? OriginalStorageKey { get; set; }

    public string? OriginalFileName { get; set; }
    public string? AltText { get; set; }

    /// <summary>MIME type of the primary <see cref="Url"/> variant.</summary>
    public string? ContentType { get; set; }
    public long? SizeBytes { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public MediaType MediaType { get; set; } = MediaType.Image;

    /// <summary>Plain FK value, not a navigation property — Domain has
    /// zero package dependencies and can't reference Infrastructure's
    /// ApplicationUser (Identity). Resolved to a display name at the
    /// Application/Api layer when needed (mirrors AuditLogEntry).</summary>
    public Guid? UploadedByUserId { get; set; }
}
