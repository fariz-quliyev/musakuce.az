using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.History;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>"Kəndimizin tarixi" timeline — spec §14.</summary>
[ApiController]
[Route("api/history")]
public class HistoryController(IHistoricalEventService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] HistoricalEventQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.HistoryView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.HistoryView);
        return Ok(await service.GetPagedAsync(query, includeEditorial, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.HistoryView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.HistoryView);
        return Ok(await service.GetByIdAsync(id, publicationStatus, includeEditorial, ct));
    }

    /// <summary>ADMIN-PRIVILEGED.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.HistoryWrite)]
    public async Task<ActionResult> Create(CreateHistoricalEventRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.HistoryWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateHistoricalEventRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.HistoryModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateHistoricalEventStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
