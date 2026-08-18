using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.History;

public class HistoricalEventService(IMusakuceDbContext db, IAuditLogService auditLog) : IHistoricalEventService
{
    public async Task<PagedResult<HistoricalEventDto>> GetPagedAsync(HistoricalEventQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var events = db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .AsQueryable();

        events = events.Where(e => e.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            events = events.Where(e => e.Title.ToLower().Contains(term));
        }

        events = events.OrderBy(e => e.DisplayOrder);

        var totalCount = await events.CountAsync(ct);
        var items = await events
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<HistoricalEventDto>.Create(items.Select(e => ToDto(e, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<HistoricalEventDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id && e.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(HistoricalEvent), id);
        return ToDto(ev, includeEditorial);
    }

    public async Task<HistoricalEventDto> CreateAsync(CreateHistoricalEventRequest request, CancellationToken ct = default)
    {
        var ev = new HistoricalEvent
        {
            Title = request.Title,
            Period = request.Period,
            EventDate = request.EventDate,
            Description = request.Description,
            DetailedText = request.DetailedText,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
            DisplayOrder = request.DisplayOrder,
            ShowInTimeline = request.ShowInTimeline,
            EventIcon = request.EventIcon,
            // The admin edit form has no separate publish step (only
            // "Yadda saxla") — saving always publishes immediately, same
            // simplification already applied to VillageProfile. Archiving
            // an entry is still possible via the /admin/tarix list row
            // actions (UpdateStatusAsync below), which this doesn't touch.
            PublicationStatus = PublicationStatus.Published,
        };

        await ApplyCoverMediaAssetAsync(ev, request.CoverMediaAssetId, ct);
        await ApplyAdditionalImagesAsync(ev, request.AdditionalImageMediaAssetIds, ct);

        db.HistoricalEvents.Add(ev);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(HistoricalEvent), ev.Id.ToString(), newValue: ev.Title, ct: ct);
        return ToDto(ev, includeEditorial: true);
    }

    public async Task<HistoricalEventDto> UpdateAsync(Guid id, UpdateHistoricalEventRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(HistoricalEvent), id);

        var oldTitle = ev.Title;
        ev.Title = request.Title;
        ev.Period = request.Period;
        ev.EventDate = request.EventDate;
        ev.Description = request.Description;
        ev.DetailedText = request.DetailedText;
        ev.SourceStatus = request.SourceStatus;
        ev.SourceReference = request.SourceReference;
        ev.EditorialNote = request.EditorialNote;
        ev.OriginalSourceText = request.OriginalSourceText;
        ev.DisplayOrder = request.DisplayOrder;
        ev.ShowInTimeline = request.ShowInTimeline;
        ev.EventIcon = request.EventIcon;
        ev.UpdatedAt = DateTimeOffset.UtcNow;
        // Same "Yadda saxla" = publish immediately simplification as
        // CreateAsync above — see its comment.
        ev.PublicationStatus = PublicationStatus.Published;

        await ApplyCoverMediaAssetAsync(ev, request.CoverMediaAssetId, ct);
        await ApplyAdditionalImagesAsync(ev, request.AdditionalImageMediaAssetIds, ct);

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(HistoricalEvent), ev.Id.ToString(), oldValue: oldTitle, newValue: ev.Title, ct: ct);
        return ToDto(ev, includeEditorial: true);
    }

    /// <summary>Same "changed? re-resolve the navigation, or NotFound if
    /// the id doesn't exist" pattern as VillageProfileService's hero/logo
    /// media handling.</summary>
    private async Task ApplyCoverMediaAssetAsync(HistoricalEvent ev, Guid? coverMediaAssetId, CancellationToken ct)
    {
        if (coverMediaAssetId == ev.CoverMediaAssetId) return;

        ev.CoverMediaAsset = coverMediaAssetId is { } id
            ? await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == id, ct) ?? throw new NotFoundException(nameof(MediaAsset), id)
            : null;
        if (coverMediaAssetId is null) ev.CoverMediaAssetId = null;
    }

    /// <summary>Wholesale replace — same strategy as ListingService's
    /// image-list handling: not a high-frequency operation, so the
    /// simplest correct approach (clear, then re-add in order) beats a
    /// diff.</summary>
    private async Task ApplyAdditionalImagesAsync(HistoricalEvent ev, List<Guid> mediaAssetIds, CancellationToken ct)
    {
        foreach (var image in ev.AdditionalImages.ToList())
            ev.AdditionalImages.Remove(image);

        foreach (var (mediaAssetId, index) in mediaAssetIds.Select((id, i) => (id, i)))
        {
            var media = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaAssetId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaAssetId);
            ev.AdditionalImages.Add(new HistoricalEventImage { MediaAsset = media, SortOrder = index });
        }
    }

    public async Task<HistoricalEventDto> UpdateStatusAsync(Guid id, UpdateHistoricalEventStatusRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(HistoricalEvent), id);

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
        await auditLog.LogAsync(action, nameof(HistoricalEvent), ev.Id.ToString(), oldStatus.ToString(), ev.PublicationStatus.ToString(), ct);

        return ToDto(ev, includeEditorial: true);
    }

    private static HistoricalEventDto ToDto(HistoricalEvent e, bool includeEditorial) => new(
        e.Id, e.Title, e.Period, e.EventDate, e.Description, e.DetailedText, e.SourceStatus, e.SourceReference,
        includeEditorial ? e.EditorialNote : null, includeEditorial ? e.OriginalSourceText : null,
        e.DisplayOrder, e.PublicationStatus, e.CoverMediaAssetId, e.CoverMediaAsset?.Url, e.ShowInTimeline, e.IsDefault, e.EventIcon,
        e.AdditionalImages.OrderBy(i => i.SortOrder).Select(i => new HistoricalEventImageDto(i.Id, i.MediaAssetId, i.MediaAsset!.Url, i.SortOrder)).ToList());
}
