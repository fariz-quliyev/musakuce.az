using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Photos;

public interface IPhotoService
{
    Task<PagedResult<PhotoDto>> GetPagedAsync(PhotoQuery query, CancellationToken ct = default);
    Task<PhotoDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default);
    Task<PhotoDto> CreateAsync(CreatePhotoRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<PhotoDto> UpdateAsync(Guid id, UpdatePhotoRequest request, CancellationToken ct = default);
    Task<PhotoDto> UpdateStatusAsync(Guid id, UpdatePhotoStatusRequest request, CancellationToken ct = default);
}
