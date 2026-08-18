using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.People;

public interface IPersonService
{
    Task<PagedResult<PersonDto>> GetPagedAsync(PersonQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<PersonDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<PersonDto> CreateAsync(CreatePersonRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<PersonDto> UpdateAsync(Guid id, UpdatePersonRequest request, CancellationToken ct = default);
    Task<PersonDto> UpdateStatusAsync(Guid id, UpdatePersonStatusRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — hard delete. Cleans up the cover
    /// image too, but only if no other content still references it.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
