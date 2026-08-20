using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Events;

public interface IEventService
{
    Task<PagedResult<EventDto>> GetPagedAsync(EventQuery query, CancellationToken ct = default);
    Task<EventDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default);
    Task<EventDto> CreateAsync(CreateEventRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<EventDto> UpdateAsync(Guid id, UpdateEventRequest request, CancellationToken ct = default);
    Task<EventDto> UpdateStatusAsync(Guid id, UpdateEventStatusRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — hard delete.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
