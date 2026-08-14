using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Interviews;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

/// <summary>"Kəndimizin səsi" — Phase 12 §G.</summary>
[ApiController]
[Route("api/interviews")]
public class InterviewsController(IInterviewService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] InterviewQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.InterviewsView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.InterviewsView);
        return Ok(await service.GetPagedAsync(query, includeEditorial, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.InterviewsView);
        if (denied is not null) return denied;
        var includeEditorial = await IsPrivilegedViewerAsync(Permissions.InterviewsView);
        return Ok(await service.GetByIdAsync(id, publicationStatus, includeEditorial, ct));
    }

    /// <summary>ADMIN-PRIVILEGED.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.InterviewsWrite)]
    public async Task<ActionResult> Create(CreateInterviewRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.InterviewsWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateInterviewRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.InterviewsModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateInterviewStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
