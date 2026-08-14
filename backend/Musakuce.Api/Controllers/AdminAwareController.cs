using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Musakuce.Api.Controllers;

/// <summary>
/// Base for controllers whose GetPaged/GetById actions serve both the
/// public site (safe status default, [AllowAnonymous]) and the admin UI
/// (explicit Pending/Draft/Rejected/Archived filter) through the same
/// route. The action itself stays [AllowAnonymous] so the public,
/// safe-default call never needs a token — but the moment a caller
/// requests a non-public status explicitly, this gate requires the
/// matching *.view permission server-side. This is the enforcement
/// point for Phase 7 §4/§10 ("pending/draft content must never be
/// exposed through public endpoints").
/// </summary>
public abstract class AdminAwareController(IAuthorizationService authorizationService) : ControllerBase
{
    protected async Task<ActionResult?> AuthorizeElevatedViewAsync(bool isElevatedRequest, string viewPolicy)
    {
        if (!isElevatedRequest)
            return null;

        if (User.Identity?.IsAuthenticated != true)
            return Unauthorized(new { message = "Authentication required to view non-public content." });

        var result = await authorizationService.AuthorizeAsync(User, viewPolicy);
        return result.Succeeded ? null : Forbid();
    }

    /// <summary>
    /// Phase 12 §7: internal editorial fields (EditorialNote,
    /// OriginalSourceText) must never reach an anonymous or unpermitted
    /// caller — including when they're just browsing Published content,
    /// not only when requesting an elevated status. Unlike
    /// AuthorizeElevatedViewAsync (which gates the request), this never
    /// blocks anything — it only tells the DTO mapper whether to include
    /// those two fields.
    /// </summary>
    protected async Task<bool> IsPrivilegedViewerAsync(string viewPolicy)
    {
        if (User.Identity?.IsAuthenticated != true)
            return false;

        var result = await authorizationService.AuthorizeAsync(User, viewPolicy);
        return result.Succeeded;
    }
}
