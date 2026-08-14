using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.LocalInfo;

public class LocalInfoService(IMusakuceDbContext db, IAuditLogService auditLog) : ILocalInfoService
{
    public async Task<PagedResult<LocalInfoEntryDto>> GetPagedAsync(LocalInfoQuery query, CancellationToken ct = default)
    {
        var entries = db.LocalInfoEntries
            .Include(e => e.PhotoMediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Kind is not null)
            entries = entries.Where(e => e.Kind == query.Kind);
        entries = entries.Where(e => e.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            entries = entries.Where(e => e.Name.ToLower().Contains(term));
        }

        entries = entries.OrderBy(e => e.Name);

        var totalCount = await entries.CountAsync(ct);
        var items = await entries
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<LocalInfoEntryDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<LocalInfoEntryDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default)
    {
        var entry = await db.LocalInfoEntries
            .Include(e => e.PhotoMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id && e.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(LocalInfoEntry), id);
        return ToDto(entry);
    }

    public async Task<LocalInfoEntryDto> CreateAsync(CreateLocalInfoEntryRequest request, CancellationToken ct = default)
    {
        if (request.AttachedToEntryId is not null)
        {
            var parentExists = await db.LocalInfoEntries.AnyAsync(e => e.Id == request.AttachedToEntryId, ct);
            if (!parentExists)
                throw new NotFoundException(nameof(LocalInfoEntry), request.AttachedToEntryId);
        }

        var entry = new LocalInfoEntry
        {
            Name = request.Name,
            Kind = request.Kind,
            Category = request.Category,
            Description = request.Description,
            ContactInfo = request.ContactInfo,
            AreaServed = request.AreaServed,
            AttachedToEntryId = request.AttachedToEntryId,
        };

        if (!string.IsNullOrWhiteSpace(request.PhotoUrl))
        {
            var media = new MediaAsset { Url = request.PhotoUrl };
            db.MediaAssets.Add(media);
            entry.PhotoMediaAsset = media;
        }

        db.LocalInfoEntries.Add(entry);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(LocalInfoEntry), entry.Id.ToString(), newValue: entry.Name, ct: ct);
        return ToDto(entry);
    }

    public async Task<LocalInfoEntryDto> UpdateAsync(Guid id, UpdateLocalInfoEntryRequest request, CancellationToken ct = default)
    {
        var entry = await db.LocalInfoEntries.Include(e => e.PhotoMediaAsset).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(LocalInfoEntry), id);

        if (request.AttachedToEntryId is not null && request.AttachedToEntryId != entry.AttachedToEntryId)
        {
            var parentExists = await db.LocalInfoEntries.AnyAsync(e => e.Id == request.AttachedToEntryId, ct);
            if (!parentExists)
                throw new NotFoundException(nameof(LocalInfoEntry), request.AttachedToEntryId);
        }

        var oldName = entry.Name;
        entry.Name = request.Name;
        entry.Kind = request.Kind;
        entry.Category = request.Category;
        entry.Description = request.Description;
        entry.ContactInfo = request.ContactInfo;
        entry.AreaServed = request.AreaServed;
        entry.AttachedToEntryId = request.AttachedToEntryId;
        entry.UpdatedAt = DateTimeOffset.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.PhotoUrl) && request.PhotoUrl != entry.PhotoMediaAsset?.Url)
        {
            var media = new MediaAsset { Url = request.PhotoUrl };
            db.MediaAssets.Add(media);
            entry.PhotoMediaAsset = media;
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(LocalInfoEntry), entry.Id.ToString(), oldValue: oldName, newValue: entry.Name, ct: ct);
        return ToDto(entry);
    }

    public async Task<LocalInfoEntryDto> UpdateStatusAsync(Guid id, UpdateLocalInfoStatusRequest request, CancellationToken ct = default)
    {
        var entry = await db.LocalInfoEntries.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException(nameof(LocalInfoEntry), id);

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
        await auditLog.LogAsync(action, nameof(LocalInfoEntry), entry.Id.ToString(), oldStatus.ToString(), entry.PublicationStatus.ToString(), ct);

        return ToDto(entry);
    }

    private static LocalInfoEntryDto ToDto(LocalInfoEntry e) => new(
        e.Id, e.Name, e.Kind, e.Category, e.Description, e.ContactInfo, e.AreaServed,
        e.PhotoMediaAsset?.Url, e.AttachedToEntryId, e.PublicationStatus);
}
