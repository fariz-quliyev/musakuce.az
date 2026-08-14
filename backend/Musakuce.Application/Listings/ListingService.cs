using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Listings;

public class ListingService(IMusakuceDbContext db, IAuditLogService auditLog) : IListingService
{
    public async Task<PagedResult<ListingDto>> GetPagedAsync(ListingQuery query, CancellationToken ct = default)
    {
        var listings = db.ClassifiedListings
            .Include(l => l.Images).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Category is not null)
            listings = listings.Where(l => l.Category == query.Category);
        if (query.ListingStatus is not null)
            listings = listings.Where(l => l.ListingStatus == query.ListingStatus);
        // No RBAC yet (Phase 7) — every caller of this endpoint is
        // effectively "the public", so an unspecified moderation filter
        // must default to Approved-only. The admin UI always passes
        // moderationStatus explicitly (it knows which tab it's showing),
        // so this stays safe without needing a separate admin route.
        listings = listings.Where(l => l.ModerationStatus == (query.ModerationStatus ?? ModerationStatus.Approved));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            listings = listings.Where(l => l.Title.ToLower().Contains(term));
        }

        listings = query.SortBy switch
        {
            "priceAsc" => listings.OrderBy(l => l.Price == null).ThenBy(l => l.Price),
            "priceDesc" => listings.OrderBy(l => l.Price == null).ThenByDescending(l => l.Price),
            _ => listings.OrderByDescending(l => l.PostedAt),
        };

        var totalCount = await listings.CountAsync(ct);
        var items = await listings
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<ListingDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<ListingDto> GetByIdAsync(Guid id, ModerationStatus? moderationStatus, CancellationToken ct = default)
    {
        // Same reasoning as GetPagedAsync: default Approved-only unless
        // the caller (the admin UI, which already knows the listing's
        // status from the list it came from) explicitly asks otherwise.
        var listing = await db.ClassifiedListings
            .Include(l => l.Images).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id && l.ModerationStatus == (moderationStatus ?? ModerationStatus.Approved), ct)
            ?? throw new NotFoundException(nameof(ClassifiedListing), id);

        return ToDto(listing);
    }

    public async Task<ListingDto> CreateAsync(CreateListingRequest request, CancellationToken ct = default)
    {
        var listing = new ClassifiedListing
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Price = request.Price,
            Location = request.Location,
            ContactName = request.ContactName,
            ContactInfo = request.ContactInfo,
        };

        foreach (var (url, index) in request.ImageUrls.Select((u, i) => (u, i)))
        {
            var media = new MediaAsset { Url = url };
            db.MediaAssets.Add(media);
            listing.Images.Add(new ListingImage { MediaAsset = media, SortOrder = index });
        }

        db.ClassifiedListings.Add(listing);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(ClassifiedListing), listing.Id.ToString(), newValue: listing.Title, ct: ct);
        return ToDto(listing);
    }

    public async Task<ListingDto> UpdateAsync(Guid id, UpdateListingRequest request, CancellationToken ct = default)
    {
        var listing = await db.ClassifiedListings
            .Include(l => l.Images).ThenInclude(i => i.MediaAsset)
            .FirstOrDefaultAsync(l => l.Id == id, ct)
            ?? throw new NotFoundException(nameof(ClassifiedListing), id);

        var oldTitle = listing.Title;
        listing.Title = request.Title;
        listing.Description = request.Description;
        listing.Category = request.Category;
        listing.Price = request.Price;
        listing.Location = request.Location;
        listing.ContactName = request.ContactName;
        listing.ContactInfo = request.ContactInfo;
        listing.UpdatedAt = DateTimeOffset.UtcNow;

        // Images: replace wholesale — simplest correct approach for an
        // admin correction form; not a high-frequency operation.
        foreach (var image in listing.Images.ToList())
            listing.Images.Remove(image);

        foreach (var (url, index) in request.ImageUrls.Select((u, i) => (u, i)))
        {
            var media = new MediaAsset { Url = url };
            db.MediaAssets.Add(media);
            listing.Images.Add(new ListingImage { MediaAsset = media, SortOrder = index });
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(ClassifiedListing), listing.Id.ToString(), oldValue: oldTitle, newValue: listing.Title, ct: ct);
        return ToDto(listing);
    }

    public async Task<ListingDto> UpdateStatusAsync(Guid id, UpdateListingStatusRequest request, CancellationToken ct = default)
    {
        var listing = await db.ClassifiedListings
            .Include(l => l.Images).ThenInclude(i => i.MediaAsset)
            .FirstOrDefaultAsync(l => l.Id == id, ct)
            ?? throw new NotFoundException(nameof(ClassifiedListing), id);

        var oldModerationStatus = listing.ModerationStatus;
        var oldListingStatus = listing.ListingStatus;

        if (request.ModerationStatus is not null)
        {
            listing.ModerationStatus = request.ModerationStatus.Value;
            listing.RejectionReason = request.ModerationStatus == ModerationStatus.Rejected
                ? request.RejectionReason
                : null;
        }
        if (request.ListingStatus is not null)
            listing.ListingStatus = request.ListingStatus.Value;
        listing.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);

        if (request.ModerationStatus is not null && request.ModerationStatus != oldModerationStatus)
        {
            var action = request.ModerationStatus switch
            {
                ModerationStatus.Approved => "Approve",
                ModerationStatus.Rejected => "Reject",
                _ => "ModerationStatusChange",
            };
            await auditLog.LogAsync(action, nameof(ClassifiedListing), listing.Id.ToString(), oldModerationStatus.ToString(), listing.ModerationStatus.ToString(), ct);
        }
        if (request.ListingStatus is not null && request.ListingStatus != oldListingStatus)
        {
            await auditLog.LogAsync("ListingStatusChange", nameof(ClassifiedListing), listing.Id.ToString(), oldListingStatus.ToString(), listing.ListingStatus.ToString(), ct);
        }

        return ToDto(listing);
    }

    private static ListingDto ToDto(ClassifiedListing l) => new(
        l.Id, l.Title, l.Description, l.Category, l.Price, l.Location, l.ContactName, l.ContactInfo,
        l.ListingStatus, l.ModerationStatus, l.RejectionReason, l.PostedAt, l.ExpiresAt,
        l.Images.OrderBy(i => i.SortOrder).Select(i => i.MediaAsset!.Url).ToList());
}
