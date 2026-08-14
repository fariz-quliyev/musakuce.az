using Musakuce.Domain.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Domain.Entities;

/// <summary>
/// "Musaküçənin yaddaşına sən də əlavə et" — spec §22. The single public
/// contribution intake for photos, videos, memories and historical
/// info. Always enters Pending; an Archivist/Editor/Administrator
/// reviews and, on approval, manually converts it into a real Photo,
/// Video, HistoricalEvent, or LocalInfoEntry record.
/// </summary>
public class CommunitySubmission : BaseEntity
{
    public required string SubmitterName { get; set; }
    public required string ContactInfo { get; set; }
    public SubmissionKind Kind { get; set; }
    public required string Description { get; set; }
    public DateOnly? SuggestedDate { get; set; }
    public string? SuggestedLocation { get; set; }
    public string? PeopleShown { get; set; }
    public string? SourceNote { get; set; }
    public bool PermissionToPublish { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
    public string? ReviewerNote { get; set; }

    public ICollection<SubmissionFile> Files { get; set; } = new List<SubmissionFile>();
}

public class SubmissionFile : BaseEntity
{
    public Guid CommunitySubmissionId { get; set; }
    public CommunitySubmission? CommunitySubmission { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
}
