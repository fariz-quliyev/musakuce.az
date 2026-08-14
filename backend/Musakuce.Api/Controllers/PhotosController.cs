using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Photos;
using Musakuce.Domain.Enums;

namespace Musakuce.Api.Controllers;

[ApiController]
[Route("api/photos")]
public class PhotosController(IPhotoService service, IAuthorizationService authorizationService)
    : AdminAwareController(authorizationService)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetPaged([FromQuery] PhotoQuery query, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            query.PublicationStatus is not null && query.PublicationStatus != PublicationStatus.Published,
            Permissions.PhotosView);
        return denied ?? Ok(await service.GetPagedAsync(query, ct));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetById(Guid id, [FromQuery] PublicationStatus? publicationStatus, CancellationToken ct)
    {
        var denied = await AuthorizeElevatedViewAsync(
            publicationStatus is not null && publicationStatus != PublicationStatus.Published,
            Permissions.PhotosView);
        return denied ?? Ok(await service.GetByIdAsync(id, publicationStatus, ct));
    }

    /// <summary>ADMIN-PRIVILEGED — no upload, URL-based only.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.PhotosWrite)]
    public async Task<ActionResult> Create(CreatePhotoRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.PhotosWrite)]
    public async Task<ActionResult> Update(Guid id, UpdatePhotoRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    /// <summary>ADMIN-PRIVILEGED — publish/unpublish/archive.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = Permissions.PhotosModerate)]
    public async Task<ActionResult> UpdateStatus(Guid id, UpdatePhotoStatusRequest request, CancellationToken ct) =>
        Ok(await service.UpdateStatusAsync(id, request, ct));
}
