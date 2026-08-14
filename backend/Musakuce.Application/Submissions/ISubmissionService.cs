using Musakuce.Application.Common;

namespace Musakuce.Application.Submissions;

public interface ISubmissionService
{
    Task<PagedResult<SubmissionDto>> GetPagedAsync(SubmissionQuery query, CancellationToken ct = default);
    Task<SubmissionDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SubmissionDto> CreateAsync(CreateSubmissionRequest request, CancellationToken ct = default);
    Task<SubmissionDto> UpdateStatusAsync(Guid id, UpdateSubmissionStatusRequest request, CancellationToken ct = default);
}
