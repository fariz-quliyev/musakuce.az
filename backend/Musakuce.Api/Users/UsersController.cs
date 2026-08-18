using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Audit;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Api.Users;

/// <summary>
/// Admin user management — spec Phase 7 §5. Administrator-only. There is
/// no public registration; every account here is created deliberately by
/// an Administrator (or the dev-only seed, see DevAdminSeeder).
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize(Policy = Permissions.UsersManage)]
public class UsersController(
    UserManager<ApplicationUser> userManager,
    IAuditLogService auditLog) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminUserDto>>> GetAll(CancellationToken ct)
    {
        var users = userManager.Users.OrderBy(u => u.Email).ToList();
        var result = new List<AdminUserDto>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            result.Add(ToDto(user, roles));
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<AdminUserDto>> Create(CreateUserRequest request, CancellationToken ct)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            EmailConfirmed = true,
        };

        var createResult = await userManager.CreateAsync(user, request.TemporaryPassword);
        if (!createResult.Succeeded)
            return BadRequest(new { errors = createResult.Errors.Select(e => e.Description) });

        await userManager.AddToRoleAsync(user, request.Role);
        await auditLog.LogAsync("UserCreated", entityType: "ApplicationUser", entityId: user.Id.ToString(), newValue: request.Role, ct: ct);

        return CreatedAtAction(nameof(GetAll), null, ToDto(user, [request.Role]));
    }

    [HttpPatch("{id:guid}/active")]
    public async Task<ActionResult<AdminUserDto>> SetActive(Guid id, SetActiveRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (request.IsActive)
        {
            await userManager.SetLockoutEndDateAsync(user, null);
        }
        else
        {
            await userManager.SetLockoutEnabledAsync(user, true);
            await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            // Security-audit fix (§Phase 4) — disabling a user previously
            // only blocked *new* logins; any token issued before the
            // disable stayed valid until it naturally expired (up to
            // 12h). This invalidates it immediately (see
            // ApplicationUser.TokensValidAfter / Program.cs's
            // OnTokenValidated).
            user.TokensValidAfter = DateTimeOffset.UtcNow;
            await userManager.UpdateAsync(user);
        }

        await auditLog.LogAsync(
            request.IsActive ? "UserEnabled" : "UserDisabled",
            entityType: "ApplicationUser", entityId: user.Id.ToString(), ct: ct);

        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToDto(user, roles));
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<ActionResult<AdminUserDto>> AssignRole(Guid id, AssignRoleRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        var currentRoles = await userManager.GetRolesAsync(user);
        var oldRole = currentRoles.FirstOrDefault();

        if (currentRoles.Count > 0)
            await userManager.RemoveFromRolesAsync(user, currentRoles);
        await userManager.AddToRoleAsync(user, request.Role);

        // Security-audit fix (§Phase 4) — roles are baked into the JWT
        // at login time, so without this, a role *downgrade* wouldn't
        // actually take effect until the user's existing token expired
        // (up to 12h) — they'd keep the old, more-privileged role's
        // access in the meantime. This forces re-authentication.
        user.TokensValidAfter = DateTimeOffset.UtcNow;
        await userManager.UpdateAsync(user);

        await auditLog.LogAsync(
            "RoleChange", entityType: "ApplicationUser", entityId: user.Id.ToString(),
            oldValue: oldRole, newValue: request.Role, ct: ct);

        return Ok(ToDto(user, [request.Role]));
    }

    /// <summary>Administrator sets the new password directly — no email
    /// flow (out of scope this phase). The password value itself is
    /// never logged, only the fact that a reset happened.</summary>
    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult> ResetPassword(Guid id, ResetPasswordRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        // Security-audit fix (§Phase 4) — a password reset (e.g. because
        // the account was compromised) should also kill any session
        // that was issued before the attacker was locked out, not just
        // block future logins with the old password.
        user.TokensValidAfter = DateTimeOffset.UtcNow;
        await userManager.UpdateAsync(user);

        await auditLog.LogAsync("PasswordReset", entityType: "ApplicationUser", entityId: user.Id.ToString(), ct: ct);
        return NoContent();
    }

    private static AdminUserDto ToDto(ApplicationUser user, IList<string> roles) => new(
        user.Id, user.Email ?? "", user.DisplayName, roles.ToList(),
        user.LockoutEnd is not null && user.LockoutEnd > DateTimeOffset.UtcNow, user.CreatedAt);
}
