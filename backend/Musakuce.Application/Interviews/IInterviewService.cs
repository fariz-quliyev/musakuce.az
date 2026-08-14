using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Interviews;

public interface IInterviewService
{
    Task<PagedResult<InterviewDto>> GetPagedAsync(InterviewQuery query, bool includeEditorial, CancellationToken ct = default);
    Task<InterviewDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    Task<InterviewDto> CreateAsync(CreateInterviewRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    Task<InterviewDto> UpdateAsync(Guid id, UpdateInterviewRequest request, CancellationToken ct = default);
    Task<InterviewDto> UpdateStatusAsync(Guid id, UpdateInterviewStatusRequest request, CancellationToken ct = default);
}
