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
        var events = db.HistoricalEvents.AsNoTracking().AsQueryable();

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
        var ev = await db.HistoricalEvents.AsNoTracking()
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
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
            DisplayOrder = request.DisplayOrder,
        };

        db.HistoricalEvents.Add(ev);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(HistoricalEvent), ev.Id.ToString(), newValue: ev.Title, ct: ct);
        return ToDto(ev, includeEditorial: true);
    }

    public async Task<HistoricalEventDto> UpdateAsync(Guid id, UpdateHistoricalEventRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(HistoricalEvent), id);

        var oldTitle = ev.Title;
        ev.Title = request.Title;
        ev.Period = request.Period;
        ev.EventDate = request.EventDate;
        ev.Description = request.Description;
        ev.SourceStatus = request.SourceStatus;
        ev.SourceReference = request.SourceReference;
        ev.EditorialNote = request.EditorialNote;
        ev.OriginalSourceText = request.OriginalSourceText;
        ev.DisplayOrder = request.DisplayOrder;
        ev.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(HistoricalEvent), ev.Id.ToString(), oldValue: oldTitle, newValue: ev.Title, ct: ct);
        return ToDto(ev, includeEditorial: true);
    }

    public async Task<HistoricalEventDto> UpdateStatusAsync(Guid id, UpdateHistoricalEventStatusRequest request, CancellationToken ct = default)
    {
        var ev = await db.HistoricalEvents.FirstOrDefaultAsync(e => e.Id == id, ct)
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
        e.Id, e.Title, e.Period, e.EventDate, e.Description, e.SourceStatus, e.SourceReference,
        includeEditorial ? e.EditorialNote : null, includeEditorial ? e.OriginalSourceText : null,
        e.DisplayOrder, e.PublicationStatus);
}
