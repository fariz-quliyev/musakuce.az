using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Events;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    /// <summary>"Kənd təqvimi" / "Bu həftə kənddə" — pass `from`/`to`
    /// (ISO instants) for date-range presets. Public callers get
    /// Published-only by default; the admin UI passes publicationStatus
    /// explicitly to see Draft content, which requires Permissions.EventsView.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] EventQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.EventsView);
        return denied ?? Ok(await service.GetPagedAsync(query, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.EventsView);
        return denied ?? Ok(await service.GetByIdAsync(id, publicationStatus, ct));
    }

    /// <summary>ADMIN-PRIVILEGED — creates an event as Draft.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.EventsWrite)]
    public async Task<ActionResult> Create(CreateEventRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.EventsWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateEventRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive ("delete" is
    /// modeled as Archived, not a hard delete, per the existing status model).</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.EventsModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateEventStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — hard delete. Same policy as
    /// publish/archive, matching the History/People precedent — this
    /// codebase has no separate "delete" permission tier.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.EventsModerate)]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
