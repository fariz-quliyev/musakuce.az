using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Memorial;

public interface IMemorialRecordService
{
    Task<PagedResult<MemorialRecordDto>> GetPagedAsync(MemorialRecordQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<MemorialRecordDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<MemorialRecordDto> CreateAsync(CreateMemorialRecordRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    Task<MemorialRecordDto> UpdateAsync(Guid id, UpdateMemorialRecordRequest request, CancellationToken ct = default);
    Task<MemorialRecordDto> UpdateStatusAsync(Guid id, UpdateMemorialRecordStatusRequest request, CancellationToken ct = default);
}
