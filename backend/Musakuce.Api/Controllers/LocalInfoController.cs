using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.LocalInfo;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>
/// "Yerli Faydalı Məlumatlar" — spec §11. Staff-managed; there is
/// deliberately no separate public submission route here (suggestions
/// arrive through /api/submissions and are converted manually).
/// </summary>
[ApiController]
[Route("api/local-info")]
public class LocalInfoController(ILocalInfoService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] LocalInfoQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.LocalInfoView);
        return denied ?? Ok(await service.GetPagedAsync(query, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.LocalInfoView);
        return denied ?? Ok(await service.GetByIdAsync(id, publicationStatus, ct));
    }

    /// <summary>ADMIN-PRIVILEGED — staff-only, not linked from the public site.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.LocalInfoWrite)]
    public async Task<ActionResult> Create(CreateLocalInfoEntryRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.LocalInfoWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateLocalInfoEntryRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.LocalInfoModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateLocalInfoStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — hard delete. Same policy as
    /// publish/archive, matching the History/People precedent — this
    /// codebase has no separate "delete" permission tier.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.LocalInfoModerate)]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
