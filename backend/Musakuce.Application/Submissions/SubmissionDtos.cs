using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Submissions;

public record SubmissionDto(
    Guid Id,
    string SubmitterName,
    string ContactInfo,
    SubmissionKind Kind,
    string Description,
    DateOnly? SuggestedDate,
    string? SuggestedLocation,
    string? PeopleShown,
    string? SourceNote,
    bool PermissionToPublish,
    SubmissionStatus Status,
    string? ReviewerNote,
    DateTimeOffset CreatedAt,
    IReadOnlyList<string> FileUrls
);

/// <summary>
/// The public "Musaküçənin yaddaşına sən də əlavə et" intake — spec §22.
/// Anonymous; always created as Pending regardless of who submits it.
/// </summary>
public class CreateSubmissionRequest
{
    public required string SubmitterName { get; set; }
    public required string ContactInfo { get; set; }
    public SubmissionKind Kind { get; set; }
    public required string Description { get; set; }
    public DateOnly? SuggestedDate { get; set; }
    public string? SuggestedLocation { get; set; }
    public string? PeopleShown { get; set; }
    public string? SourceNote { get; set; }
    public required bool PermissionToPublish { get; set; }
    public List<string> FileUrls { get; set; } = [];
}

public class UpdateSubmissionStatusRequest
{
    public required SubmissionStatus Status { get; set; }
    public string? ReviewerNote { get; set; }
}

public class SubmissionQuery : PagedQuery
{
    public SubmissionKind? Kind { get; set; }
    public SubmissionStatus? Status { get; set; }
}
