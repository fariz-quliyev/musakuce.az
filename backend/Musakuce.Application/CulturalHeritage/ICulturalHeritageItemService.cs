using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.CulturalHeritage;

public interface ICulturalHeritageItemService
{
    Task<PagedResult<CulturalHeritageItemDto>> GetPagedAsync(CulturalHeritageItemQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<CulturalHeritageItemDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<CulturalHeritageItemDto> CreateAsync(CreateCulturalHeritageItemRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    Task<CulturalHeritageItemDto> UpdateAsync(Guid id, UpdateCulturalHeritageItemRequest request, CancellationToken ct = default);
    Task<CulturalHeritageItemDto> UpdateStatusAsync(Guid id, UpdateCulturalHeritageItemStatusRequest request, CancellationToken ct = default);
}
