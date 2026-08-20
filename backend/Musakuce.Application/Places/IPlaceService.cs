using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Places;

public interface IPlaceService
{
    Task<PagedResult<PlaceDto>> GetPagedAsync(PlaceQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<PlaceDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<PlaceDto> CreateAsync(CreatePlaceRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    Task<PlaceDto> UpdateAsync(Guid id, UpdatePlaceRequest request, CancellationToken ct = default);
    Task<PlaceDto> UpdateStatusAsync(Guid id, UpdatePlaceStatusRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — hard delete.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
