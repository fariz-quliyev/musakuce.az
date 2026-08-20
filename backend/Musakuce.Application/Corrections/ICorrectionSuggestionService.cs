using Musakuce.Application.Common;

namespace Musakuce.Application.Corrections;

public interface ICorrectionSuggestionService
{
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<PagedResult<CorrectionSuggestionDto>> GetPagedAsync(CorrectionSuggestionQuery query, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<CorrectionSuggestionDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    /// <summary>The one genuinely public, anonymous write path.</summary>
    Task<CorrectionSuggestionDto> CreateAsync(CreateCorrectionSuggestionRequest request, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED — approve/reject. Does not itself change
    /// the target entity; the reviewer applies the change manually via
    /// that content type's own admin form.</summary>
    Task<CorrectionSuggestionDto> UpdateStatusAsync(Guid id, UpdateCorrectionSuggestionStatusRequest request, CancellationToken ct = default);
}
