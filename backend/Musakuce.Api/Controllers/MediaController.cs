using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Musakuce.Api.Authorization;
using Musakuce.Application.Common;
using Musakuce.Application.Media;

namespace Musakuce.Api.Controllers;

/// <summary>
/// Image upload pipeline — Phase 8. Two endpoints, deliberately kept
/// separate rather than one generic one: admin uploads are attributed
/// to the authenticated actor and feed straight into the CMS (Photos,
/// People, Events, LocalInfo); community uploads are anonymous, capped
/// smaller, and only ever end up attached to a Pending
/// CommunitySubmission — see CommunitySubmissionForm on the frontend.
/// Neither endpoint accepts anything but JPEG/PNG/WebP/AVIF images —
/// there is no general-purpose file upload here, and no video upload
/// (kept URL-only, per Phase 8 scope §7).
/// </summary>
[ApiController]
[Route("api/media")]
public class MediaController(IMediaUploadService uploadService) : ControllerBase
{
    private static readonly string[] AllowedContentTypes =
        ["image/jpeg", "image/pjpeg", "image/png", "image/webp", "image/avif"];

    /// <summary>ADMIN-PRIVILEGED — any role with at least one *.write
    /// permission can upload; whether the resulting MediaAsset can be
    /// attached to a given resource is still gated by that resource's
    /// own *.write policy (e.g. PhotosController.Create).</summary>
    [HttpPost("upload")]
    [Authorize(Policy = Permissions.MediaUpload)]
    [RequestSizeLimit(MediaUploadService.AdminMaxImageBytes + 1_048_576)]
    [RequestFormLimits(MultipartBodyLengthLimit = MediaUploadService.AdminMaxImageBytes + 1_048_576)]
    public async Task<ActionResult<MediaAssetDto>> UploadAdmin(IFormFile? file, CancellationToken ct)
    {
        ValidateBasicShape(file);
        await using var stream = file!.OpenReadStream();
        var result = await uploadService.UploadAdminImageAsync(stream, file.FileName, file.Length, ct);
        return Ok(result);
    }

    /// <summary>Public, anonymous — the only unauthenticated upload
    /// surface in the system. Smaller size cap, rate-limited, and the
    /// resulting MediaAsset is only ever useful once a caller attaches
    /// its URL to a CommunitySubmission (which always starts Pending).</summary>
    [HttpPost("community-upload")]
    [AllowAnonymous]
    [EnableRateLimiting("community-upload")]
    [RequestSizeLimit(MediaUploadService.CommunityMaxImageBytes + 1_048_576)]
    [RequestFormLimits(MultipartBodyLengthLimit = MediaUploadService.CommunityMaxImageBytes + 1_048_576)]
    public async Task<ActionResult<MediaAssetDto>> UploadCommunity(IFormFile? file, CancellationToken ct)
    {
        ValidateBasicShape(file);
        await using var stream = file!.OpenReadStream();
        var result = await uploadService.UploadCommunityImageAsync(stream, file.FileName, file.Length, ct);
        return Ok(result);
    }

    private static void ValidateBasicShape(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            throw new InvalidMediaException("No file was provided.");
        if (!AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            throw new InvalidMediaException("Only JPEG, PNG, WebP, and AVIF images are supported.");
    }
}
