using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.CulturalHeritage;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>"Mədəni irs" — Phase 12 §F.</summary>
[ApiController]
[Route("api/cultural-heritage")]
public class CulturalHeritageController(ICulturalHeritageItemService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] CulturalHeritageItemQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.CulturalHeritageView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.CulturalHeritageView);
        return Ok(await service.GetPagedAsync(query, includeEditorial, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.CulturalHeritageView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.CulturalHeritageView);
        return Ok(await service.GetByIdAsync(id, publicationStatus, includeEditorial, ct));
    }

    /// <summary>ADMIN-PRIVILEGED.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.CulturalHeritageWrite)]
    public async Task<ActionResult> Create(CreateCulturalHeritageItemRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.CulturalHeritageWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateCulturalHeritageItemRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.CulturalHeritageModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateCulturalHeritageItemStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
