using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Musakuce.Api.Authorization;
using Musakuce.Application.Abstractions;
using Musakuce.Infrastructure.Data;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Tests;

public static class TestUsers
{
    public const string Password = "Test_Passw0rd!123";
    public const string AdministratorEmail = "administrator@test.local";
    public const string EditorEmail = "editor@test.local";
    public const string ArchivistEmail = "archivist@test.local";
    public const string ModeratorEmail = "moderator@test.local";
}

/// <summary>
/// Hosts the real Musakuce.Api pipeline (real controllers, real
/// authorization policies, real JWT validation) against an isolated
/// EF Core InMemory database instead of Postgres — fast, no Docker
/// dependency, but still exercises the actual authorization wiring
/// end-to-end via real HTTP requests.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = "Host=unused;Database=unused;Username=unused;Password=unused",
                ["Jwt:Secret"] = "test-only-signing-key-1234567890-abcdefghijklmnopqrstuvwxyz",
                ["Cors:AllowedOrigins:0"] = "http://localhost:3000",
                // Deliberately no Admin:SeedEmail/SeedPassword — tests
                // seed their own known-password users below instead.
                // MediaStorage:* below are never actually used — the
                // real S3 client is swapped for FakeMediaStorage — but
                // MediaStorageOptions still needs values bound so the
                // (unused) IAmazonS3 singleton factory doesn't throw.
                ["MediaStorage:Bucket"] = "test-bucket",
                ["MediaStorage:AccessKey"] = "test",
                ["MediaStorage:SecretKey"] = "test",
                ["MediaStorage:Endpoint"] = "http://unused.test",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Removing only DbContextOptions<T> leaves EF's internal
            // IDbContextOptionsConfiguration<T> (and similar) registered
            // from AddInfrastructure's UseNpgsql call, which then
            // collides with the InMemory provider added below ("only a
            // single database provider can be registered"). Sweep every
            // descriptor that references MusakuceDbContext instead.
            var toRemove = services
                .Where(d => d.ServiceType == typeof(MusakuceDbContext)
                    || (d.ServiceType.IsGenericType && d.ServiceType.GetGenericArguments().Contains(typeof(MusakuceDbContext))))
                .ToList();
            foreach (var d in toRemove)
                services.Remove(d);

            services.AddDbContext<MusakuceDbContext>(options => options.UseInMemoryDatabase(_dbName));

            // Swap the real S3-backed IMediaStorage for an in-memory
            // fake — no MinIO/S3 dependency in tests. The real IAmazonS3
            // singleton stays registered (MediaStorageBootstrapper uses
            // it directly at startup, not through IMediaStorage); it
            // points at a placeholder endpoint that will fail to
            // connect, which MediaStorageBootstrapper already treats as
            // a non-fatal, logged-only warning.
            services.RemoveAll<IMediaStorage>();
            services.AddSingleton<IMediaStorage, FakeMediaStorage>();
        });
    }

    /// <summary>Seeds the four roles and one known-password test user per
    /// role. Call once per test class via IAsyncLifetime/constructor.</summary>
    public async Task SeedAsync()
    {
        using var scope = Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        await CreateTestUserAsync(userManager, TestUsers.AdministratorEmail, Roles.Administrator);
        await CreateTestUserAsync(userManager, TestUsers.EditorEmail, Roles.Editor);
        await CreateTestUserAsync(userManager, TestUsers.ArchivistEmail, Roles.Archivist);
        await CreateTestUserAsync(userManager, TestUsers.ModeratorEmail, Roles.Moderator);
    }

    private static async Task CreateTestUserAsync(UserManager<ApplicationUser> userManager, string email, string role)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
            return;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = role,
            EmailConfirmed = true,
        };
        var result = await userManager.CreateAsync(user, TestUsers.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, role);
    }
}
