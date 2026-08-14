using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Listings;

public interface IListingService
{
    Task<PagedResult<ListingDto>> GetPagedAsync(ListingQuery query, CancellationToken ct = default);
    /// <summary>`moderationStatus` null defaults to Approved-only (public
    /// safe default); the admin UI passes it explicitly.</summary>
    Task<ListingDto> GetByIdAsync(Guid id, ModerationStatus? moderationStatus, CancellationToken ct = default);
    Task<ListingDto> CreateAsync(CreateListingRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — see UpdateListingRequest.</summary>
    Task<ListingDto> UpdateAsync(Guid id, UpdateListingRequest request, CancellationToken ct = default);
    Task<ListingDto> UpdateStatusAsync(Guid id, UpdateListingStatusRequest request, CancellationToken ct = default);
}
