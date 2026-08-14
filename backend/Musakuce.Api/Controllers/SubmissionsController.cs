using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Submissions;

namespace Musakuce.Api.Controllers;

/// <summary>
/// "Musaküçənin yaddaşına sən də əlavə et" — spec §22. `Create` is the
/// one genuinely public, anonymous write endpoint in this controller;
/// listing/reviewing submissions is always admin-privileged — there is
/// no "public" view of this resource at any status.
/// </summary>
[ApiController]
[Route("api/submissions")]
public class SubmissionsController(ISubmissionService service) : ControllerBase
{
    /// <summary>ADMIN-PRIVILEGED — the moderation inbox listing (all statuses, incl. contact info).</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.SubmissionsView)]
    public async Task<ActionResult> GetPaged([FromQuery] SubmissionQuery query, CancellationToken ct) =>
        Ok(await service.GetPagedAsync(query, ct));

    /// <summary>ADMIN-PRIVILEGED — exposes submitter contact info.</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.SubmissionsView)]
    public async Task<ActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await service.GetByIdAsync(id, ct));

    /// <summary>The one genuinely public, anonymous write endpoint on this controller.</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult> Create(CreateSubmissionRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — approve/reject/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.SubmissionsModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateSubmissionStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
