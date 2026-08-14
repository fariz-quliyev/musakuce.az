using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Memorial;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>"Xatirə" — Phase 12 §E.</summary>
[ApiController]
[Route("api/memorial")]
public class MemorialController(IMemorialRecordService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] MemorialRecordQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.MemorialView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.MemorialView);
        return Ok(await service.GetPagedAsync(query, includeEditorial, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.MemorialView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.MemorialView);
        return Ok(await service.GetByIdAsync(id, publicationStatus, includeEditorial, ct));
    }

    /// <summary>ADMIN-PRIVILEGED.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.MemorialWrite)]
    public async Task<ActionResult> Create(CreateMemorialRecordRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.MemorialWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateMemorialRecordRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.MemorialModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateMemorialRecordStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
