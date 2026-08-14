using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.VillageProfiles;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>"Kəndimiz" village-level settings — Phase 12 §2. Singleton
/// resource: no {id} in the route, only ever one row.</summary>
[ApiController]
[Route("api/village-profile")]
public class VillageProfileController(IVillageProfileService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> Get([FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.VillageProfileView);
        if (denied is not null) return denied;

        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.VillageProfileView);
        var profile = await service.GetAsync(publicationStatus, includeEditorial, ct);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>ADMIN-PRIVILEGED — upserts the single row.</summary>
    [HttpPut]
    [Authorize(Policy = Permissions.VillageProfileWrite)]
    public async Task<ActionResult> Upsert(UpsertVillageProfileRequest request, CancellationToken ct) =>
        Ok(await service.UpsertAsync(request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("status")]
    [Authorize(Policy = Permissions.VillageProfileModerate)]
    public async Task<ActionResult> UpdateStatus(UpdateVillageProfileStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(request, ct));
}
