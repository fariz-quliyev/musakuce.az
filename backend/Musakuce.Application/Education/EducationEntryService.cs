using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Education;

public class EducationEntryService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IEducationEntryService
{
    public async Task<PagedResult<EducationEntryDto>> GetPagedAsync(EducationEntryQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var entries = db.EducationEntries.Include(e => e.CoverMediaAsset).AsNoTracking().AsQueryable();

        if (query.Kind is not null)
            entries = entries.Where(e => e.Kind == query.Kind);
        entries = entries.Where(e => e.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            entries = entries.Where(e => e.Title.ToLower().Contains(term));
        }

        entries = entries.OrderBy(e => e.Title);

        var totalCount = await entries.CountAsync(ct);
        var items = await entries
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<EducationEntryDto>.Create(items.Select(e => ToDto(e, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<EducationEntryDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var entry = await db.EducationEntries
            .Include(e => e.CoverMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id && e.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(EducationEntry), id);
        return ToDto(entry, includeEditorial);
    }

    public async Task<EducationEntryDto> CreateAsync(CreateEducationEntryRequest request, CancellationToken ct = default)
    {
        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var entry = new EducationEntry
        {
            Title = request.Title,
            Slug = SlugGenerator.Generate(request.Title),
            Summary = request.Summary,
            Content = request.Content,
            Kind = request.Kind,
            Period = request.Period,
            EventDate = request.EventDate,
            RelatedPersonId = request.RelatedPersonId,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            entry.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.EducationEntries.Add(entry);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(EducationEntry), entry.Id.ToString(), newValue: entry.Title, ct: ct);
        return ToDto(entry, includeEditorial: true);
    }

    public async Task<EducationEntryDto> UpdateAsync(Guid id, UpdateEducationEntryRequest request, CancellationToken ct = default)
    {
        var entry = await db.EducationEntries.Include(e => e.CoverMediaAsset).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(EducationEntry), id);

        if (request.RelatedPersonId is { } relatedId && !await db.People.AnyAsync(p => p.Id == relatedId, ct))
            throw new NotFoundException(nameof(Person), relatedId);

        var oldTitle = entry.Title;
        var oldMediaAssetId = entry.CoverMediaAssetId;

        entry.Title = request.Title;
        entry.Slug = SlugGenerator.Generate(request.Title);
        entry.Summary = request.Summary;
        entry.Content = request.Content;
        entry.Kind = request.Kind;
        entry.Period = request.Period;
        entry.EventDate = request.EventDate;
        entry.RelatedPersonId = request.RelatedPersonId;
        entry.SourceStatus = request.SourceStatus;
        entry.SourceReference = request.SourceReference;
        entry.EditorialNote = request.EditorialNote;
        entry.OriginalSourceText = request.OriginalSourceText;
        entry.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != entry.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                entry.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                entry.CoverMediaAsset = null;
                entry.CoverMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(EducationEntry), entry.Id.ToString(), oldValue: oldTitle, newValue: entry.Title, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != entry.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(entry, includeEditorial: true);
    }

    public async Task<EducationEntryDto> UpdateStatusAsync(Guid id, UpdateEducationEntryStatusRequest request, CancellationToken ct = default)
    {
        var entry = await db.EducationEntries.Include(e => e.CoverMediaAsset).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(EducationEntry), id);

        var oldStatus = entry.PublicationStatus;
        entry.PublicationStatus = request.PublicationStatus;
        entry.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(EducationEntry), entry.Id.ToString(), oldStatus.ToString(), entry.PublicationStatus.ToString(), ct);
        return ToDto(entry, includeEditorial: true);
    }

    /// <summary>Hard delete — mirrors HistoricalEventService.DeleteAsync.</summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entry = await db.EducationEntries.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(EducationEntry), id);

        var title = entry.Title;
        var coverMediaAssetId = entry.CoverMediaAssetId;

        db.EducationEntries.Remove(entry);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Delete", nameof(EducationEntry), id.ToString(), oldValue: title, ct: ct);

        if (coverMediaAssetId is { } mediaId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(mediaId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }
    }

    private static EducationEntryDto ToDto(EducationEntry e, bool includeEditorial) => new(
        e.Id, e.Title, e.Slug, e.Summary, e.Content, e.Kind, e.Period, e.EventDate,
        e.CoverMediaAssetId, e.CoverMediaAsset?.Url, e.RelatedPersonId, e.SourceStatus, e.SourceReference,
        includeEditorial ? e.EditorialNote : null, includeEditorial ? e.OriginalSourceText : null,
        e.PublicationStatus);
}
