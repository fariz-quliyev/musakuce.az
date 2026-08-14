using Microsoft.AspNetCore.Authorization;

namespace Musakuce.Api.Authorization;

public class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}

/// <summary>
/// Resolves permissions purely from the JWT's role claims against the
/// in-code Roles.Permissions map — no database lookup per request. This
/// means a role's permission set can be changed by redeploying code, but
/// a specific user's role reassignment only takes effect on their next
/// login (their current JWT keeps the role claim it was issued with).
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var roleClaims = context.User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);

        foreach (var role in roleClaims)
        {
            if (Roles.Permissions.TryGetValue(role, out var permissions) && permissions.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
                break;
            }
        }

        return Task.CompletedTask;
    }
}
