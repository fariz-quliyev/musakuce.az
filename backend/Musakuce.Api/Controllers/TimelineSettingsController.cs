using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Timeline;

namespace Musakuce.Api.Controllers;

/// <summary>Section-level display settings for /kendimiz's "Zaman
/// xəttində Musaküçə" timeline. Singleton resource: no {id} in the
/// route, only ever one row — same shape as VillageProfileController.
/// Reuses the History permission set (Permissions.HistoryView/Write)
/// rather than a new namespace, since this is display configuration for
/// the same Tarix/History module, not a separate content type.</summary>
[ApiController]
[Route("api/timeline-settings")]
public class TimelineSettingsController(ITimelineSettingsService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> Get(CancellationToken ct)
    {
        var settings = await service.GetAsync(ct);
        return settings is null ? NotFound() : Ok(settings);
    }

    /// <summary>ADMIN-PRIVILEGED — upserts the single row.</summary>
    [HttpPut]
    [Authorize(Policy = Permissions.HistoryWrite)]
    public async Task<ActionResult> Upsert(UpsertTimelineSettingsRequest request, CancellationToken ct) =>
        Ok(await service.UpsertAsync(request, ct));
}
