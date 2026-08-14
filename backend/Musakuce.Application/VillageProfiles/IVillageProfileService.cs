using Musakuce.Domain.Enums;

namespace Musakuce.Application.VillageProfiles;

public interface IVillageProfileService
{
    /// <summary>Null when no row exists in the requested status yet
    /// (e.g. nothing has ever been published) — the public homepage
    /// treats this the same as any other not-yet-connected API call and
    /// falls back to mock content, never an error page.</summary>
    Task<VillageProfileDto?> GetAsync(PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<VillageProfileDto> UpsertAsync(UpsertVillageProfileRequest request, CancellationToken ct = default);
    Task<VillageProfileDto> UpdateStatusAsync(UpdateVillageProfileStatusRequest request, CancellationToken ct = default);
}
