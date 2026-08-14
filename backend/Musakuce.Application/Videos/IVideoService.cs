using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Videos;

public interface IVideoService
{
    Task<PagedResult<VideoDto>> GetPagedAsync(VideoQuery query, CancellationToken ct = default);
    Task<VideoDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default);
    Task<VideoDto> CreateAsync(CreateVideoRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<VideoDto> UpdateAsync(Guid id, UpdateVideoRequest request, CancellationToken ct = default);
    Task<VideoDto> UpdateStatusAsync(Guid id, UpdateVideoStatusRequest request, CancellationToken ct = default);
}
