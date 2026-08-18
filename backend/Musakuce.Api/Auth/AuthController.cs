using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Musakuce.Api.Authorization;
using Musakuce.Application.Audit;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Api.Auth;

/// <summary>
/// Stateless JWT auth for the admin/CMS only — spec Phase 7 §1. There is
/// no public registration endpoint; accounts are created by an
/// Administrator via /api/users or the dev-only seed (see
/// Musakuce.Api/Auth/DevAdminSeeder).
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenService tokenService,
    IAuditLogService auditLog) : ControllerBase
{
    /// <summary>
    /// Rate-limited (see Program.cs "login" policy) to blunt credential
    /// stuffing / brute force, on top of Identity's own account lockout.
    /// Never reveals whether the email exists — always the same generic
    /// 401 message on any failure.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            await auditLog.LogAsync("LoginFailed", entityType: "ApplicationUser", entityId: request.Email, ct: ct);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            await auditLog.LogAsync(
                result.IsLockedOut ? "LoginFailedLockedOut" : "LoginFailed",
                entityType: "ApplicationUser", entityId: user.Id.ToString(), ct: ct);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var roles = await userManager.GetRolesAsync(user);
        var (token, expiresAt) = tokenService.GenerateToken(user, roles);

        await auditLog.LogAsync("Login", entityType: "ApplicationUser", entityId: user.Id.ToString(), ct: ct);

        return Ok(new LoginResponse(token, expiresAt, ToDto(user, roles)));
    }

    /// <summary>Security-audit fix (§Phase 4) — this used to just record
    /// the audit event, since a stateless JWT has no server-side session
    /// to invalidate. It now also bumps TokensValidAfter, so the token
    /// this very request was authenticated with (and anything issued
    /// before it) stops being accepted on its next use — the closest
    /// this architecture gets to a real server-side logout without a
    /// session store. The client (Next.js login route) is still
    /// responsible for discarding the token cookie for this device.</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout(CancellationToken ct)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userId, out var id))
        {
            var user = await userManager.FindByIdAsync(id.ToString());
            if (user is not null)
            {
                user.TokensValidAfter = DateTimeOffset.UtcNow;
                await userManager.UpdateAsync(user);
            }
        }

        await auditLog.LogAsync("Logout", entityType: "ApplicationUser", entityId: userId, ct: ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var id))
            return Unauthorized();

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToDto(user, roles));
    }

    private static CurrentUserDto ToDto(ApplicationUser user, IList<string> roles)
    {
        var permissions = roles
            .SelectMany(r => Roles.Permissions.TryGetValue(r, out var p) ? p : [])
            .Distinct()
            .ToList();
        return new CurrentUserDto(user.Id, user.Email ?? "", user.DisplayName, roles.ToList(), permissions);
    }
}
