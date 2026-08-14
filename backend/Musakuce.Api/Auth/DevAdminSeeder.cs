using Microsoft.AspNetCore.Identity;
using Musakuce.Api.Authorization;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Api.Auth;

/// <summary>
/// Startup seeding — spec Phase 7 §9.
///
/// EnsureRolesSeededAsync runs in every environment: the four admin
/// roles must exist for the app to function at all, and creating them
/// is idempotent/harmless.
///
/// SeedDevAdministratorAsync runs in Development only, and only creates
/// an account if ALL of Admin__SeedEmail / Admin__SeedPassword /
/// Admin__SeedDisplayName are supplied via environment variables/
/// configuration — there is no hard-coded password. See README for how
/// to create the first Administrator in any other environment (through
/// this same mechanism with real secrets supplied at deploy time, or
/// manually via psql + the API's own password hashing by first
/// registering through this seeder once).
/// </summary>
public static class DevAdminSeeder
{
    public static async Task EnsureRolesSeededAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    public static async Task SeedDevAdministratorAsync(IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["Admin:SeedEmail"];
        var password = configuration["Admin:SeedPassword"];
        var displayName = configuration["Admin:SeedDisplayName"] ?? "Administrator";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogInformation(
                "No dev administrator seeded — set Admin__SeedEmail and Admin__SeedPassword environment variables to create one.");
            return;
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            logger.LogInformation("Dev administrator {Email} already exists — skipping seed.", email);
            return;
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
            logger.LogError(
                "Failed to seed dev administrator {Email}: {Errors}",
                email, string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(user, Roles.Administrator);
        logger.LogInformation("Seeded dev administrator {Email}.", email);
    }
}
