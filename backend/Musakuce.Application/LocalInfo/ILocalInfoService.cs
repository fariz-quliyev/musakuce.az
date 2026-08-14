using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.LocalInfo;

public interface ILocalInfoService
{
    Task<PagedResult<LocalInfoEntryDto>> GetPagedAsync(LocalInfoQuery query, CancellationToken ct = default);
    Task<LocalInfoEntryDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default);
    Task<LocalInfoEntryDto> CreateAsync(CreateLocalInfoEntryRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<LocalInfoEntryDto> UpdateAsync(Guid id, UpdateLocalInfoEntryRequest request, CancellationToken ct = default);
    Task<LocalInfoEntryDto> UpdateStatusAsync(Guid id, UpdateLocalInfoStatusRequest request, CancellationToken ct = default);
}
