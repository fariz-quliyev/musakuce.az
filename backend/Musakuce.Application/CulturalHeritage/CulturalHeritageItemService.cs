using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.CulturalHeritage;

public class CulturalHeritageItemService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : ICulturalHeritageItemService
{
    public async Task<PagedResult<CulturalHeritageItemDto>> GetPagedAsync(CulturalHeritageItemQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var items = db.CulturalHeritageItems.Include(i => i.CoverMediaAsset).AsNoTracking().AsQueryable();

        if (query.Kind is not null)
            items = items.Where(i => i.Kind == query.Kind);
        items = items.Where(i => i.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            items = items.Where(i => i.Title.ToLower().Contains(term));
        }

        items = items.OrderBy(i => i.Title);

        var totalCount = await items.CountAsync(ct);
        var pageItems = await items
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<CulturalHeritageItemDto>.Create(pageItems.Select(i => ToDto(i, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<CulturalHeritageItemDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var item = await db.CulturalHeritageItems
            .Include(i => i.CoverMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id && i.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(CulturalHeritageItem), id);
        return ToDto(item, includeEditorial);
    }

    public async Task<CulturalHeritageItemDto> CreateAsync(CreateCulturalHeritageItemRequest request, CancellationToken ct = default)
    {
        var item = new CulturalHeritageItem
        {
            Title = request.Title,
            Kind = request.Kind,
            Description = request.Description,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            item.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.CulturalHeritageItems.Add(item);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(CulturalHeritageItem), item.Id.ToString(), newValue: item.Title, ct: ct);
        return ToDto(item, includeEditorial: true);
    }

    public async Task<CulturalHeritageItemDto> UpdateAsync(Guid id, UpdateCulturalHeritageItemRequest request, CancellationToken ct = default)
    {
        var item = await db.CulturalHeritageItems.Include(i => i.CoverMediaAsset).FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException(nameof(CulturalHeritageItem), id);

        var oldTitle = item.Title;
        var oldMediaAssetId = item.CoverMediaAssetId;

        item.Title = request.Title;
        item.Kind = request.Kind;
        item.Description = request.Description;
        item.SourceStatus = request.SourceStatus;
        item.SourceReference = request.SourceReference;
        item.EditorialNote = request.EditorialNote;
        item.OriginalSourceText = request.OriginalSourceText;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != item.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                item.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                item.CoverMediaAsset = null;
                item.CoverMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(CulturalHeritageItem), item.Id.ToString(), oldValue: oldTitle, newValue: item.Title, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != item.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(item, includeEditorial: true);
    }

    public async Task<CulturalHeritageItemDto> UpdateStatusAsync(Guid id, UpdateCulturalHeritageItemStatusRequest request, CancellationToken ct = default)
    {
        var item = await db.CulturalHeritageItems.Include(i => i.CoverMediaAsset).FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException(nameof(CulturalHeritageItem), id);

        var oldStatus = item.PublicationStatus;
        item.PublicationStatus = request.PublicationStatus;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(CulturalHeritageItem), item.Id.ToString(), oldStatus.ToString(), item.PublicationStatus.ToString(), ct);
        return ToDto(item, includeEditorial: true);
    }

    /// <summary>Hard delete — mirrors HistoricalEventService.DeleteAsync.</summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.CulturalHeritageItems.FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new NotFoundException(nameof(CulturalHeritageItem), id);

        var title = item.Title;
        var coverMediaAssetId = item.CoverMediaAssetId;

        db.CulturalHeritageItems.Remove(item);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Delete", nameof(CulturalHeritageItem), id.ToString(), oldValue: title, ct: ct);

        if (coverMediaAssetId is { } mediaId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(mediaId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }
    }

    private static CulturalHeritageItemDto ToDto(CulturalHeritageItem i, bool includeEditorial) => new(
        i.Id, i.Title, i.Kind, i.Description, i.CoverMediaAssetId, i.CoverMediaAsset?.Url, i.SourceStatus, i.SourceReference,
        includeEditorial ? i.EditorialNote : null, includeEditorial ? i.OriginalSourceText : null,
        i.PublicationStatus);
}
