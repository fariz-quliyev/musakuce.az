using Microsoft.AspNetCore.Identity;
using Musakuce.Api.Authorization;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Api.Auth;

/// <summary>
/// Phase 15 §3 — explicit, one-time production Administrator bootstrap.
/// Distinct from <see cref="DevAdminSeeder"/> (which only ever runs
/// automatically in Development, from Program.cs's normal startup path):
/// this only runs when the process is launched with the
/// <c>--bootstrap-admin</c> argument (see Program.cs), never on ordinary
/// `dotnet Musakuce.Api.dll` startup — so a production container can
/// restart indefinitely without ever re-running this.
///
/// Reuses the same ASP.NET Identity UserManager/RoleManager as the rest
/// of the app (no separate auth system), the same password policy
/// (Musakuce.Infrastructure/DependencyInjection.cs), and the same
/// Administrator role from the existing RBAC model — this is purely a
/// controlled entry point, not new architecture.
/// </summary>
public static class AdminBootstrap
{
    /// <returns>Process exit code: 0 on success or "already exists" (safe to re-run), 1 on misconfiguration/failure.</returns>
    public static async Task<int> RunAsync(IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["AdminBootstrap:Email"];
        var password = configuration["AdminBootstrap:Password"];
        var displayName = configuration["AdminBootstrap:DisplayName"] ?? "Administrator";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogError(
                "Admin bootstrap requires AdminBootstrap__Email and AdminBootstrap__Password to be set. " +
                "Nothing was created.");
            return 1;
        }

        // Roles must exist before we can assign one — normally already
        // seeded by the app's ordinary startup path, but this call is
        // idempotent and cheap, so it's safe to repeat here in case
        // bootstrap ever runs before the API's first normal boot.
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            // Never resets an existing password or re-assigns roles —
            // running this twice (or against an already-bootstrapped
            // environment) must be a safe no-op, not a surprise reset.
            var isAlreadyAdmin = await userManager.IsInRoleAsync(existing, Roles.Administrator);
            logger.LogInformation(
                "Admin bootstrap: {Email} already exists (Administrator role: {HasRole}) — no changes made.",
                email, isAlreadyAdmin);
            return 0;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = displayName,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            // Identity's error descriptions describe policy violations
            // (e.g. "too short") — never echo the attempted password itself.
            logger.LogError(
                "Admin bootstrap failed for {Email}: {Errors}",
                email, string.Join("; ", result.Errors.Select(e => e.Description)));
            return 1;
        }

        await userManager.AddToRoleAsync(user, Roles.Administrator);
        logger.LogInformation("Admin bootstrap: created Administrator account for {Email}.", email);
        return 0;
    }
}
