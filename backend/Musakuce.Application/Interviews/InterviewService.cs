using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Interviews;

public class InterviewService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IInterviewService
{
    public async Task<PagedResult<InterviewDto>> GetPagedAsync(InterviewQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var interviews = db.Interviews.Include(i => i.ThumbnailMediaAsset).AsNoTracking().AsQueryable();

        interviews = interviews.Where(i => i.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            interviews = interviews.Where(i => i.PersonName.ToLower().Contains(term));
        }

        interviews = interviews.OrderByDescending(i => i.RecordingDate).ThenByDescending(i => i.CreatedAt);

        var totalCount = await interviews.CountAsync(ct);
        var items = await interviews
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<InterviewDto>.Create(items.Select(i => ToDto(i, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<InterviewDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var interview = await db.Interviews
            .Include(i => i.ThumbnailMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id && i.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(Interview), id);
        return ToDto(interview, includeEditorial);
    }

    public async Task<InterviewDto> CreateAsync(CreateInterviewRequest request, CancellationToken ct = default)
    {
        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var interview = new Interview
        {
            PersonName = request.PersonName,
            RelatedPersonId = request.RelatedPersonId,
            Title = request.Title,
            Description = request.Description,
            Transcript = request.Transcript,
            EmbedProvider = request.EmbedProvider,
            EmbedUrlOrKey = request.EmbedUrlOrKey,
            RecordingDate = request.RecordingDate,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
        };

        if (request.ThumbnailMediaAssetId is { } mediaId)
        {
            interview.ThumbnailMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.Interviews.Add(interview);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Interview), interview.Id.ToString(), newValue: interview.PersonName, ct: ct);
        return ToDto(interview, includeEditorial: true);
    }

    public async Task<InterviewDto> UpdateAsync(Guid id, UpdateInterviewRequest request, CancellationToken ct = default)
    {
        var interview = await db.Interviews.Include(i => i.ThumbnailMediaAsset).FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException(nameof(Interview), id);

        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var oldName = interview.PersonName;
        var oldMediaAssetId = interview.ThumbnailMediaAssetId;

        interview.PersonName = request.PersonName;
        interview.RelatedPersonId = request.RelatedPersonId;
        interview.Title = request.Title;
        interview.Description = request.Description;
        interview.Transcript = request.Transcript;
        interview.EmbedProvider = request.EmbedProvider;
        interview.EmbedUrlOrKey = request.EmbedUrlOrKey;
        interview.RecordingDate = request.RecordingDate;
        interview.SourceStatus = request.SourceStatus;
        interview.SourceReference = request.SourceReference;
        interview.EditorialNote = request.EditorialNote;
        interview.OriginalSourceText = request.OriginalSourceText;
        interview.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.ThumbnailMediaAssetId != interview.ThumbnailMediaAssetId)
        {
            if (request.ThumbnailMediaAssetId is { } newMediaId)
            {
                interview.ThumbnailMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                interview.ThumbnailMediaAsset = null;
                interview.ThumbnailMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Interview), interview.Id.ToString(), oldValue: oldName, newValue: interview.PersonName, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != interview.ThumbnailMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(interview, includeEditorial: true);
    }

    public async Task<InterviewDto> UpdateStatusAsync(Guid id, UpdateInterviewStatusRequest request, CancellationToken ct = default)
    {
        var interview = await db.Interviews.Include(i => i.ThumbnailMediaAsset).FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException(nameof(Interview), id);

        var oldStatus = interview.PublicationStatus;
        interview.PublicationStatus = request.PublicationStatus;
        interview.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(Interview), interview.Id.ToString(), oldStatus.ToString(), interview.PublicationStatus.ToString(), ct);
        return ToDto(interview, includeEditorial: true);
    }

    private static InterviewDto ToDto(Interview i, bool includeEditorial) => new(
        i.Id, i.PersonName, i.RelatedPersonId, i.Title, i.Description, i.Transcript,
        i.EmbedProvider, i.EmbedUrlOrKey, i.ThumbnailMediaAssetId, i.ThumbnailMediaAsset?.Url,
        i.RecordingDate, i.SourceStatus, i.SourceReference,
        includeEditorial ? i.EditorialNote : null, includeEditorial ? i.OriginalSourceText : null,
        i.PublicationStatus);
}
