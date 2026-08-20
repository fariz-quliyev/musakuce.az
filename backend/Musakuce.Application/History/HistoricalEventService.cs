using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.History;

public class HistoricalEventService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IHistoricalEventService
{
    public async Task<PagedResult<HistoricalEventDto>> GetPagedAsync(HistoricalEventQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var events = db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.IconMediaAsset)
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
            .Include(e => e.IconMediaAsset)
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
        await ApplyIconMediaAssetAsync(ev, request.IconMediaAssetId, ct);

        // Added before ApplyAdditionalImagesAsync (not after, as it used
        // to be) — that method needs ev already tracked so its own
        // intermediate SaveChangesAsync (see its doc comment) has
        // something valid to flush.
        db.HistoricalEvents.Add(ev);
        await ApplyAdditionalImagesAsync(ev, request.AdditionalImageMediaAssetIds, ct);

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(HistoricalEvent), ev.Id.ToString(), newValue: ev.Title, ct: ct);
        return ToDto(ev, includeEditorial: true);
    }

    public async Task<HistoricalEventDto> UpdateAsync(Guid id, UpdateHistoricalEventRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.IconMediaAsset)
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
        await ApplyIconMediaAssetAsync(ev, request.IconMediaAssetId, ct);
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

    /// <summary>Same pattern as ApplyCoverMediaAssetAsync — the optional
    /// custom marker image that overrides EventIcon on the timeline.</summary>
    private async Task ApplyIconMediaAssetAsync(HistoricalEvent ev, Guid? iconMediaAssetId, CancellationToken ct)
    {
        if (iconMediaAssetId == ev.IconMediaAssetId) return;

        ev.IconMediaAsset = iconMediaAssetId is { } id
            ? await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == id, ct) ?? throw new NotFoundException(nameof(MediaAsset), id)
            : null;
        if (iconMediaAssetId is null) ev.IconMediaAssetId = null;
    }

    /// <summary>Wholesale replace — with two corrections, both confirmed
    /// by actually reproducing the failure against a real save, not just
    /// code review. Mirrors the identical fix already applied to
    /// PersonService.ApplyAdditionalImagesAsync for Person's own
    /// AdditionalImages (same root cause, same shape of bug, found there
    /// first):
    ///
    /// 1. The original version did a blind clear-then-recreate (remove
    /// every existing row, re-add one row per incoming id), which throws
    /// a DbUpdateConcurrencyException whenever the new list is a STRICT
    /// SUBSET of the old one (e.g. removing 1 of 3 images while keeping
    /// the other 2). Diffing instead — only remove rows whose
    /// MediaAssetId truly isn't in the new list, only insert rows for
    /// MediaAssetIds not already present, and just update SortOrder in
    /// place for ones that persist — is also less work for the common
    /// case where most images are unchanged between saves.
    ///
    /// 2. Even with that diff in place, removing+updating existing rows
    /// and inserting new ones for the SAME table in a single
    /// SaveChangesAsync batch still throws the same
    /// DbUpdateConcurrencyException (an EF Core + Npgsql provider
    /// batching limitation, not something fixable from LINQ-level code)
    /// — a brand-new INSERT-shaped entity gets emitted as an UPDATE
    /// against its own (never-before-persisted) id, hitting 0 matching
    /// rows. Flushing the delete/update phase in its own
    /// SaveChangesAsync before the insert phase avoids the mixed batch
    /// entirely. Callers must ensure `ev` is already tracked (Added or
    /// loaded from the DB) before calling this, since the intermediate
    /// save needs something valid to flush.</summary>
    private async Task ApplyAdditionalImagesAsync(HistoricalEvent ev, List<Guid> mediaAssetIds, CancellationToken ct)
    {
        var toRemove = ev.AdditionalImages.Where(image => !mediaAssetIds.Contains(image.MediaAssetId)).ToList();
        foreach (var image in toRemove)
            ev.AdditionalImages.Remove(image);

        for (var index = 0; index < mediaAssetIds.Count; index++)
        {
            var existing = ev.AdditionalImages.FirstOrDefault(image => image.MediaAssetId == mediaAssetIds[index]);
            if (existing is not null) existing.SortOrder = index;
        }

        await db.SaveChangesAsync(ct);

        for (var index = 0; index < mediaAssetIds.Count; index++)
        {
            var mediaAssetId = mediaAssetIds[index];
            if (ev.AdditionalImages.Any(image => image.MediaAssetId == mediaAssetId)) continue;

            var media = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaAssetId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaAssetId);
            var newImage = new HistoricalEventImage { HistoricalEventId = ev.Id, MediaAssetId = mediaAssetId, MediaAsset = media, SortOrder = index };
            // db.HistoricalEventImages.Add (not ev.AdditionalImages.Add):
            // adding via the navigation collection left EF's change
            // tracker guessing this brand-new entity's state from its
            // (non-default, client-generated) Guid key instead of
            // trusting that it's genuinely new, which produced an UPDATE
            // against a row that never existed. DbSet.Add is the
            // unambiguous, explicit way to mark an entity Added
            // regardless of its key value.
            db.HistoricalEventImages.Add(newImage);
        }
    }

    public async Task<HistoricalEventDto> UpdateStatusAsync(Guid id, UpdateHistoricalEventStatusRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents
            .Include(e => e.CoverMediaAsset)
            .Include(e => e.IconMediaAsset)
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

    /// <summary>Hard delete — mirrors PersonService.DeleteAsync (same
    /// precedent: cascade-deletes AdditionalImages via the FK's own
    /// Cascade behavior, then best-effort-cleans up every media field
    /// this entity owned, including the cover and the custom marker
    /// icon, neither of which PersonService has an equivalent of).</summary>
    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents.Include(e => e.AdditionalImages).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(HistoricalEvent), id);

        var title = ev.Title;
        var coverMediaAssetId = ev.CoverMediaAssetId;
        var iconMediaAssetId = ev.IconMediaAssetId;
        var albumMediaAssetIds = ev.AdditionalImages.Select(i => i.MediaAssetId).ToList();

        db.HistoricalEvents.Remove(ev);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Delete", nameof(HistoricalEvent), id.ToString(), oldValue: title, ct: ct);

        foreach (var mediaId in albumMediaAssetIds.Cast<Guid?>().Append(coverMediaAssetId).Append(iconMediaAssetId).OfType<Guid>())
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(mediaId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }
    }

    private static HistoricalEventDto ToDto(HistoricalEvent e, bool includeEditorial) => new(
        e.Id, e.Title, e.Period, e.EventDate, e.Description, e.DetailedText, e.SourceStatus, e.SourceReference,
        includeEditorial ? e.EditorialNote : null, includeEditorial ? e.OriginalSourceText : null,
        e.DisplayOrder, e.PublicationStatus, e.CoverMediaAssetId, e.CoverMediaAsset?.Url, e.ShowInTimeline, e.IsDefault, e.EventIcon,
        e.IconMediaAssetId, e.IconMediaAsset?.Url,
        e.AdditionalImages.OrderBy(i => i.SortOrder).Select(i => new HistoricalEventImageDto(i.Id, i.MediaAssetId, i.MediaAsset!.Url, i.SortOrder)).ToList());
}
