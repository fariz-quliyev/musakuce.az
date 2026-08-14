using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Memorial;

public class MemorialRecordService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IMemorialRecordService
{
    public async Task<PagedResult<MemorialRecordDto>> GetPagedAsync(MemorialRecordQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var records = db.MemorialRecords.Include(r => r.CoverMediaAsset).AsNoTracking().AsQueryable();

        if (query.Category is not null)
            records = records.Where(r => r.Category == query.Category);
        records = records.Where(r => r.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            records = records.Where(r => r.FullName.ToLower().Contains(term));
        }

        records = records.OrderBy(r => r.FullName);

        var totalCount = await records.CountAsync(ct);
        var items = await records
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<MemorialRecordDto>.Create(items.Select(r => ToDto(r, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<MemorialRecordDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var record = await db.MemorialRecords
            .Include(r => r.CoverMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id && r.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(MemorialRecord), id);
        return ToDto(record, includeEditorial);
    }

    public async Task<MemorialRecordDto> CreateAsync(CreateMemorialRecordRequest request, CancellationToken ct = default)
    {
        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var record = new MemorialRecord
        {
            FullName = request.FullName,
            FatherName = request.FatherName,
            Category = request.Category,
            BirthDate = request.BirthDate,
            DeathDate = request.DeathDate,
            Biography = request.Biography,
            Achievements = request.Achievements,
            RelatedPersonId = request.RelatedPersonId,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            record.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.MemorialRecords.Add(record);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(MemorialRecord), record.Id.ToString(), newValue: record.FullName, ct: ct);
        return ToDto(record, includeEditorial: true);
    }

    public async Task<MemorialRecordDto> UpdateAsync(Guid id, UpdateMemorialRecordRequest request, CancellationToken ct = default)
    {
        var record = await db.MemorialRecords.Include(r => r.CoverMediaAsset).FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new NotFoundException(nameof(MemorialRecord), id);

        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var oldName = record.FullName;
        var oldMediaAssetId = record.CoverMediaAssetId;

        record.FullName = request.FullName;
        record.FatherName = request.FatherName;
        record.Category = request.Category;
        record.BirthDate = request.BirthDate;
        record.DeathDate = request.DeathDate;
        record.Biography = request.Biography;
        record.Achievements = request.Achievements;
        record.RelatedPersonId = request.RelatedPersonId;
        record.SourceStatus = request.SourceStatus;
        record.SourceReference = request.SourceReference;
        record.EditorialNote = request.EditorialNote;
        record.OriginalSourceText = request.OriginalSourceText;
        record.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != record.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                record.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                record.CoverMediaAsset = null;
                record.CoverMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(MemorialRecord), record.Id.ToString(), oldValue: oldName, newValue: record.FullName, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != record.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(record, includeEditorial: true);
    }

    public async Task<MemorialRecordDto> UpdateStatusAsync(Guid id, UpdateMemorialRecordStatusRequest request, CancellationToken ct = default)
    {
        var record = await db.MemorialRecords.Include(r => r.CoverMediaAsset).FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new NotFoundException(nameof(MemorialRecord), id);

        var oldStatus = record.PublicationStatus;
        record.PublicationStatus = request.PublicationStatus;
        record.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(MemorialRecord), record.Id.ToString(), oldStatus.ToString(), record.PublicationStatus.ToString(), ct);
        return ToDto(record, includeEditorial: true);
    }

    private static MemorialRecordDto ToDto(MemorialRecord r, bool includeEditorial) => new(
        r.Id, r.FullName, r.FatherName, r.Category, r.BirthDate, r.DeathDate, r.Biography, r.Achievements,
        r.CoverMediaAssetId, r.CoverMediaAsset?.Url, r.RelatedPersonId, r.SourceStatus, r.SourceReference,
        includeEditorial ? r.EditorialNote : null, includeEditorial ? r.OriginalSourceText : null,
        r.PublicationStatus);
}
