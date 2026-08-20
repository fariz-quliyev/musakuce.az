using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Places;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>Powers "Musaküçə xəritədə" (/xerite) and its Phase 11 admin
/// CMS (/admin/yerler) — one Place table, Historical + Useful kinds, per
/// spec §5/§23.</summary>
[ApiController]
[Route("api/places")]
public class PlacesController(IPlaceService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] PlaceQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.PlacesView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.PlacesView);
        return Ok(await service.GetPagedAsync(query, includeEditorial, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.PlacesView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.PlacesView);
        return Ok(await service.GetByIdAsync(id, publicationStatus, includeEditorial, ct));
    }

    /// <summary>ADMIN-PRIVILEGED.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.PlacesWrite)]
    public async Task<ActionResult> Create(CreatePlaceRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.PlacesWrite)]
    public async Task<ActionResult> Update(Guid id, UpdatePlaceRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.PlacesModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdatePlaceStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — hard delete. Same policy as
    /// publish/archive, matching the History/People precedent — this
    /// codebase has no separate "delete" permission tier.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.PlacesModerate)]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
