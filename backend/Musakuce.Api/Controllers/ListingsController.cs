using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Musakuce.Api.Authorization;
using Musakuce.Application.Listings;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

[ApiController]
[Route("api/listings")]
public class ListingsController(IListingService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    /// <summary>"Kəndin elanlar taxtası" — paged, filterable classifieds
    /// list. Public callers get Approved-only by default; the admin UI
    /// passes moderationStatus explicitly to see Pending/Rejected, which
    /// requires Permissions.ListingsView.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] ListingQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.ModerationStatus is not null && query.ModerationStatus != ModerationStatus.Approved,
            Permissions.ListingsView);
        return denied ?? Ok(await service.GetPagedAsync(query, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] ModerationStatus? moderationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            moderationStatus is not null && moderationStatus != ModerationStatus.Approved,
            Permissions.ListingsView);
        return denied ?? Ok(await service.GetByIdAsync(id, moderationStatus, ct));
    }

    /// <summary>Public, anonymous submission — always created Pending/Active.</summary>
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("anonymous-write")]
    public async Task<ActionResult> Create(CreateListingRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.ListingsWrite)]
    public async Task<ActionResult> Update(Guid id, UpdateListingRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED moderation action (approve/reject, mark sold/expired/removed).</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.ListingsModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdateListingStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
