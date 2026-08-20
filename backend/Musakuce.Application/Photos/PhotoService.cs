using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Photos;

public class PhotoService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IPhotoService
{
    public async Task<PagedResult<PhotoDto>> GetPagedAsync(PhotoQuery query, CancellationToken ct = default)
    {
        var photos = db.Photos.Include(p => p.MediaAsset).Include(p => p.RestoredMediaAsset).AsNoTracking().AsQueryable();

        if (query.Category is not null)
            photos = photos.Where(p => p.Category == query.Category);
        photos = photos.Where(p => p.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            photos = photos.Where(p => p.Title.ToLower().Contains(term));
        }

        photos = photos.OrderByDescending(p => p.CreatedAt);

        var totalCount = await photos.CountAsync(ct);
        var items = await photos
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<PhotoDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<PhotoDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default)
    {
        var photo = await db.Photos.Include(p => p.MediaAsset).Include(p => p.RestoredMediaAsset).AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(Photo), id);
        return ToDto(photo);
    }

    public async Task<PhotoDto> CreateAsync(CreatePhotoRequest request, CancellationToken ct = default)
    {
        var media = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == request.MediaAssetId, ct)
            ?? throw new NotFoundException(nameof(MediaAsset), request.MediaAssetId);
        media.AltText = request.AltText;

        var photo = new Photo
        {
            Title = request.Title,
            TakenDate = request.TakenDate,
            Location = request.Location,
            Description = request.Description,
            Story = request.Story,
            Category = request.Category,
            SourceStatus = request.SourceStatus,
            UploaderName = request.UploaderName,
            MediaAsset = media,
        };

        if (request.RestoredMediaAssetId is { } restoredId)
        {
            photo.RestoredMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == restoredId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), restoredId);
        }

        db.Photos.Add(photo);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Photo), photo.Id.ToString(), newValue: photo.Title, ct: ct);
        return ToDto(photo);
    }

    public async Task<PhotoDto> UpdateAsync(Guid id, UpdatePhotoRequest request, CancellationToken ct = default)
    {
        var photo = await db.Photos.Include(p => p.MediaAsset).Include(p => p.RestoredMediaAsset).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Photo), id);

        var oldTitle = photo.Title;
        var oldMediaAssetId = photo.MediaAssetId;
        var oldRestoredMediaAssetId = photo.RestoredMediaAssetId;

        photo.Title = request.Title;
        photo.TakenDate = request.TakenDate;
        photo.Location = request.Location;
        photo.Description = request.Description;
        photo.Story = request.Story;
        photo.Category = request.Category;
        photo.SourceStatus = request.SourceStatus;
        photo.UploaderName = request.UploaderName;
        photo.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.MediaAssetId != photo.MediaAssetId)
        {
            var newMedia = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == request.MediaAssetId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), request.MediaAssetId);
            newMedia.AltText = request.AltText;
            photo.MediaAssetId = newMedia.Id;
            photo.MediaAsset = newMedia;
        }
        else if (photo.MediaAsset is not null)
        {
            photo.MediaAsset.AltText = request.AltText;
        }

        if (request.RestoredMediaAssetId != photo.RestoredMediaAssetId)
        {
            if (request.RestoredMediaAssetId is { } newRestoredId)
            {
                photo.RestoredMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newRestoredId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newRestoredId);
            }
            else
            {
                photo.RestoredMediaAsset = null;
                photo.RestoredMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Photo), photo.Id.ToString(), oldValue: oldTitle, newValue: photo.Title, ct: ct);

        if (oldMediaAssetId != photo.MediaAssetId)
        {
            // Best-effort: the image was replaced — clean up the old
            // MediaAsset's storage objects if nothing else references it.
            // A failure here (e.g. it's still referenced elsewhere) must
            // never fail the photo update itself.
            try { await mediaUploadService.DeleteIfUnreferencedAsync(oldMediaAssetId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        if (oldRestoredMediaAssetId is { } removedRestoredId && oldRestoredMediaAssetId != photo.RestoredMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedRestoredId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(photo);
    }

    public async Task<PhotoDto> UpdateStatusAsync(Guid id, UpdatePhotoStatusRequest request, CancellationToken ct = default)
    {
        var photo = await db.Photos.Include(p => p.MediaAsset).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Photo), id);

        var oldStatus = photo.PublicationStatus;
        photo.PublicationStatus = request.PublicationStatus;
        photo.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(Photo), photo.Id.ToString(), oldStatus.ToString(), photo.PublicationStatus.ToString(), ct);

        return ToDto(photo);
    }

    /// <summary>Hard delete — mirrors HistoricalEventService.DeleteAsync.
    /// Unlike the other content types, Photo.MediaAssetId is required
    /// (never null) — the image is the content, not an optional cover.</summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var photo = await db.Photos.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Photo), id);

        var title = photo.Title;
        var mediaAssetId = photo.MediaAssetId;
        var restoredMediaAssetId = photo.RestoredMediaAssetId;

        db.Photos.Remove(photo);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Delete", nameof(Photo), id.ToString(), oldValue: title, ct: ct);

        try { await mediaUploadService.DeleteIfUnreferencedAsync(mediaAssetId, ct); }
        catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }

        if (restoredMediaAssetId is { } restoredId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(restoredId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }
    }

    private static PhotoDto ToDto(Photo p) => new(
        p.Id, p.Title, p.TakenDate, p.Location, p.Description, p.Story, p.Category,
        p.SourceStatus, p.UploaderName, p.MediaAssetId, p.MediaAsset!.Url, p.MediaAsset.AltText,
        p.RestoredMediaAssetId, p.RestoredMediaAsset?.Url, p.PublicationStatus);
}
