using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Events;

public class EventService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IEventService
{
    public async Task<PagedResult<EventDto>> GetPagedAsync(EventQuery query, CancellationToken ct = default)
    {
        var events = db.VillageEvents
            .Include(e => e.CoverMediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Category is not null)
            events = events.Where(e => e.Category == query.Category);
        // No RBAC yet (Phase 7) — default to Published-only so Draft
        // content is never visible unless explicitly requested.
        events = events.Where(e => e.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (query.From is not null)
            events = events.Where(e => e.StartsAt >= query.From);
        if (query.To is not null)
            events = events.Where(e => e.StartsAt <= query.To);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            events = events.Where(e => e.Title.ToLower().Contains(term));
        }

        events = events.OrderBy(e => e.StartsAt);

        var totalCount = await events.CountAsync(ct);
        var items = await events
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<EventDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<EventDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default)
    {
        var ev = await db.VillageEvents
            .Include(e => e.CoverMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id && e.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(VillageEvent), id);
        return ToDto(ev);
    }

    public async Task<EventDto> CreateAsync(CreateEventRequest request, CancellationToken ct = default)
    {
        var ev = new VillageEvent
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            Location = request.Location,
            PlaceId = request.PlaceId,
            OrganizerName = request.OrganizerName,
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            ev.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.VillageEvents.Add(ev);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(VillageEvent), ev.Id.ToString(), newValue: ev.Title, ct: ct);
        return ToDto(ev);
    }

    public async Task<EventDto> UpdateAsync(Guid id, UpdateEventRequest request, CancellationToken ct = default)
    {
        var ev = await db.VillageEvents.Include(e => e.CoverMediaAsset).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(VillageEvent), id);

        var oldTitle = ev.Title;
        var oldMediaAssetId = ev.CoverMediaAssetId;

        ev.Title = request.Title;
        ev.Description = request.Description;
        ev.Category = request.Category;
        ev.StartsAt = request.StartsAt;
        ev.EndsAt = request.EndsAt;
        ev.Location = request.Location;
        ev.PlaceId = request.PlaceId;
        ev.OrganizerName = request.OrganizerName;
        ev.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != ev.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                ev.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                ev.CoverMediaAsset = null;
                ev.CoverMediaAssetId = null;
            }
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(VillageEvent), ev.Id.ToString(), oldValue: oldTitle, newValue: ev.Title, ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != ev.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(ev);
    }

    public async Task<EventDto> UpdateStatusAsync(Guid id, UpdateEventStatusRequest request, CancellationToken ct = default)
    {
        var ev = await db.VillageEvents.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(VillageEvent), id);

        var oldStatus = ev.PublicationStatus;
        ev.PublicationStatus = request.PublicationStatus;
        ev.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(VillageEvent), ev.Id.ToString(), oldStatus.ToString(), ev.PublicationStatus.ToString(), ct);

        return ToDto(ev);
    }

    private static EventDto ToDto(VillageEvent e) => new(
        e.Id, e.Title, e.Description, e.Category, e.StartsAt, e.EndsAt, e.Location, e.PlaceId,
        e.OrganizerName, e.CoverMediaAssetId, e.CoverMediaAsset?.Url, e.PublicationStatus);
}
