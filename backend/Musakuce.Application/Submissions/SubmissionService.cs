using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;

namespace Musakuce.Application.Submissions;

public class SubmissionService(IMusakuceDbContext db, IAuditLogService auditLog) : ISubmissionService
{
    public async Task<PagedResult<SubmissionDto>> GetPagedAsync(SubmissionQuery query, CancellationToken ct = default)
    {
        var submissions = db.CommunitySubmissions
            .Include(s => s.Files).ThenInclude(f => f.MediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Kind is not null)
            submissions = submissions.Where(s => s.Kind == query.Kind);
        if (query.Status is not null)
            submissions = submissions.Where(s => s.Status == query.Status);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            submissions = submissions.Where(s => s.Description.ToLower().Contains(term));
        }

        submissions = submissions.OrderByDescending(s => s.CreatedAt);

        var totalCount = await submissions.CountAsync(ct);
        var items = await submissions
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<SubmissionDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<SubmissionDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var submission = await db.CommunitySubmissions
            .Include(s => s.Files).ThenInclude(f => f.MediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException(nameof(CommunitySubmission), id);
        return ToDto(submission);
    }

    public async Task<SubmissionDto> CreateAsync(CreateSubmissionRequest request, CancellationToken ct = default)
    {
        var submission = new CommunitySubmission
        {
            SubmitterName = request.SubmitterName,
            ContactInfo = request.ContactInfo,
            Kind = request.Kind,
            Description = request.Description,
            SuggestedDate = request.SuggestedDate,
            SuggestedLocation = request.SuggestedLocation,
            PeopleShown = request.PeopleShown,
            SourceNote = request.SourceNote,
            PermissionToPublish = request.PermissionToPublish,
        };

        foreach (var url in request.FileUrls)
        {
            var media = new MediaAsset { Url = url };
            db.MediaAssets.Add(media);
            submission.Files.Add(new SubmissionFile { MediaAsset = media });
        }

        db.CommunitySubmissions.Add(submission);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(CommunitySubmission), submission.Id.ToString(), newValue: submission.Kind.ToString(), ct: ct);
        return ToDto(submission);
    }

    public async Task<SubmissionDto> UpdateStatusAsync(Guid id, UpdateSubmissionStatusRequest request, CancellationToken ct = default)
    {
        var submission = await db.CommunitySubmissions
            .Include(s => s.Files).ThenInclude(f => f.MediaAsset)
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException(nameof(CommunitySubmission), id);

        var oldStatus = submission.Status;
        submission.Status = request.Status;
        submission.ReviewerNote = request.ReviewerNote;
        submission.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.Status switch
        {
            Domain.Enums.SubmissionStatus.Approved => "Approve",
            Domain.Enums.SubmissionStatus.Rejected => "Reject",
            Domain.Enums.SubmissionStatus.Archived => "Archive",
            Domain.Enums.SubmissionStatus.Converted => "Convert",
            _ => "SubmissionStatusChange",
        };
        await auditLog.LogAsync(action, nameof(CommunitySubmission), submission.Id.ToString(), oldStatus.ToString(), submission.Status.ToString(), ct);

        return ToDto(submission);
    }

    private static SubmissionDto ToDto(CommunitySubmission s) => new(
        s.Id, s.SubmitterName, s.ContactInfo, s.Kind, s.Description, s.SuggestedDate, s.SuggestedLocation,
        s.PeopleShown, s.SourceNote, s.PermissionToPublish, s.Status, s.ReviewerNote, s.CreatedAt,
        s.Files.Select(f => f.MediaAsset!.Url).ToList());
}
