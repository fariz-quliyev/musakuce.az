using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Musakuce.Api.Authorization;
using Musakuce.Application.Corrections;

namespace Musakuce.Api.Controllers;

/// <summary>
/// "Düzəliş təklif et" — readers propose a correction, addition, or
/// photo for an already-existing public content record. `Create` is the
/// one genuinely public, anonymous write endpoint; listing/reviewing
/// suggestions (incl. contact info) is always admin-privileged, same
/// shape as SubmissionsController.
/// </summary>
[ApiController]
[Route("api/corrections")]
public class CorrectionsController(ICorrectionSuggestionService service) : ControllerBase
{
    /// <summary>ADMIN-PRIVILEGED — the moderation inbox listing.</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.CorrectionsView)]
    public async Task<ActionResult> GetPaged([FromQuery] CorrectionSuggestionQuery query, CancellationToken ct) =>
        Ok(await service.GetPagedAsync(query, ct));

    /// <summary>ADMIN-PRIVILEGED — exposes submitter contact info.</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = Permissions.CorrectionsView)]
    public async Task<ActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await service.GetByIdAsync(id, ct));

    /// <summary>The one genuinely public, anonymous write endpoint on this controller.</summary>
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("anonymous-write")]
    public async Task<ActionResult> Create(CreateCorrectionSuggestionRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — approve/reject. Does not itself apply
    /// the change to the target entity — see CorrectionSuggestion's own
    /// doc comment.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.CorrectionsModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateCorrectionSuggestionStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
