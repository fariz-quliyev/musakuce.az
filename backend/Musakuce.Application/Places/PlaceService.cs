using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Places;

public class PlaceService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IPlaceService
{
    public async Task<PagedResult<PlaceDto>> GetPagedAsync(PlaceQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var places = db.Places
            .Include(p => p.CoverMediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Kind is not null)
            places = places.Where(p => p.Kind == query.Kind);
        if (query.Category is not null)
            places = places.Where(p => p.Category == query.Category);
        places = places.Where(p => p.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            places = places.Where(p => p.Name.ToLower().Contains(term));
        }

        places = places.OrderBy(p => p.Name);

        var totalCount = await places.CountAsync(ct);
        var items = await places
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<PlaceDto>.Create(items.Select(p => ToDto(p, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<PlaceDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var place = await db.Places
            .Include(p => p.CoverMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(Place), id);
        return ToDto(place, includeEditorial);
    }

    public async Task<PlaceDto> CreateAsync(CreatePlaceRequest request, CancellationToken ct = default)
    {
        var place = new Place
        {
            Name = request.Name,
            Slug = SlugGenerator.Generate(request.Name),
            Kind = request.Kind,
            Category = request.Category,
            Description = request.Description,
            HistoricalBackground = request.HistoricalBackground,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            place.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.Places.Add(place);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Place), place.Id.ToString(), newValue: place.Name, ct: ct);
        return ToDto(place, includeEditorial: true);
    }

    public async Task<PlaceDto> UpdateAsync(Guid id, UpdatePlaceRequest request, CancellationToken ct = default)
    {
        var place = await db.Places.Include(p => p.CoverMediaAsset).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Place), id);

        var oldName = place.Name;
        var oldMediaAssetId = place.CoverMediaAssetId;

        place.Name = request.Name;
        place.Slug = SlugGenerator.Generate(request.Name);
        place.Kind = request.Kind;
        place.Category = request.Category;
        place.Description = request.Description;
        place.HistoricalBackground = request.HistoricalBackground;
        place.Latitude = request.Latitude;
        place.Longitude = request.Longitude;
        place.SourceStatus = request.SourceStatus;
        place.SourceReference = request.SourceReference;
        place.EditorialNote = request.EditorialNote;
        place.OriginalSourceText = request.OriginalSourceText;
        place.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != place.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                place.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                place.CoverMediaAsset = null;
                place.CoverMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Place), place.Id.ToString(), oldValue: oldName, newValue: place.Name, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != place.CoverMediaAssetId)
        {
            // Best-effort: the photo was replaced/removed — clean up the
            // old MediaAsset's storage objects if nothing else references
            // it. A failure here must never fail the Place update itself.
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(place, includeEditorial: true);
    }

    public async Task<PlaceDto> UpdateStatusAsync(Guid id, UpdatePlaceStatusRequest request, CancellationToken ct = default)
    {
        var place = await db.Places.Include(p => p.CoverMediaAsset).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Place), id);

        var oldStatus = place.PublicationStatus;
        place.PublicationStatus = request.PublicationStatus;
        place.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(Place), place.Id.ToString(), oldStatus.ToString(), place.PublicationStatus.ToString(), ct);
        return ToDto(place, includeEditorial: true);
    }

    private static PlaceDto ToDto(Place p, bool includeEditorial) => new(
        p.Id, p.Name, p.Slug, p.Kind, p.Category, p.Description, p.HistoricalBackground,
        p.Latitude, p.Longitude, p.CoverMediaAssetId, p.CoverMediaAsset?.Url, p.SourceStatus, p.SourceReference,
        includeEditorial ? p.EditorialNote : null, includeEditorial ? p.OriginalSourceText : null,
        p.PublicationStatus, p.CreatedAt, p.UpdatedAt);
}
