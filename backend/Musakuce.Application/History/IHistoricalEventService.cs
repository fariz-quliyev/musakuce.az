using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.History;

public interface IHistoricalEventService
{
    Task<PagedResult<HistoricalEventDto>> GetPagedAsync(HistoricalEventQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<HistoricalEventDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<HistoricalEventDto> CreateAsync(CreateHistoricalEventRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<HistoricalEventDto> UpdateAsync(Guid id, UpdateHistoricalEventRequest request, CancellationToken ct = default);
    Task<HistoricalEventDto> UpdateStatusAsync(Guid id, UpdateHistoricalEventStatusRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — hard delete.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
