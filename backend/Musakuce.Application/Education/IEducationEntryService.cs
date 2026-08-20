using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Education;

public interface IEducationEntryService
{
    Task<PagedResult<EducationEntryDto>> GetPagedAsync(EducationEntryQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<EducationEntryDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<EducationEntryDto> CreateAsync(CreateEducationEntryRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    Task<EducationEntryDto> UpdateAsync(Guid id, UpdateEducationEntryRequest request, CancellationToken ct = default);
    Task<EducationEntryDto> UpdateStatusAsync(Guid id, UpdateEducationEntryStatusRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — hard delete.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
