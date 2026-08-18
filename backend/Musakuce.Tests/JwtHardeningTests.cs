using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Tests;

/// <summary>
/// Security-audit fix (§Phase 4) — covers the token-revocation mechanism
/// added to close the audit's "no server-side JWT revocation" finding:
/// TokensValidAfter on ApplicationUser, checked in Program.cs's
/// JwtBearerEvents.OnTokenValidated. Must match the signing key
/// CustomWebApplicationFactory configures ("Jwt:Secret") to produce a
/// token the API will actually accept as authentically signed.
/// </summary>
public class JwtHardeningTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private const string TestSigningKey = "test-only-signing-key-1234567890-abcdefghijklmnopqrstuvwxyz";

    private readonly CustomWebApplicationFactory _factory;

    public JwtHardeningTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Valid_token_is_accepted()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Garbage_token_is_rejected()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-real-token");
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Expired_token_is_rejected()
    {
        var (userId, email) = await GetTestUserAsync(TestUsers.EditorEmail);
        var expiredToken = BuildToken(userId, email, "Editor", issuedAt: DateTimeOffset.UtcNow.AddHours(-13), expires: DateTimeOffset.UtcNow.AddHours(-1));

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", expiredToken);
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Token_issued_before_a_revocation_watermark_is_rejected_after_logout()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ArchivistEmail);

        // The token is valid up to and including the logout call itself...
        var preLogout = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, preLogout.StatusCode);

        var logout = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        // ...but is rejected on any request after it, without a new login.
        var postLogout = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, postLogout.StatusCode);
    }

    [Fact]
    public async Task Token_is_rejected_after_the_account_is_disabled()
    {
        var moderatorClient = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);
        var (moderatorId, _) = await GetTestUserAsync(TestUsers.ModeratorEmail);

        var adminClient = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var disable = await adminClient.PatchAsJsonAsync($"/api/users/{moderatorId}/active", new { isActive = false });
        Assert.Equal(HttpStatusCode.OK, disable.StatusCode);

        var response = await moderatorClient.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // Cleanup — re-enable so this test doesn't poison the shared
        // per-class database for any test that runs after it.
        await adminClient.PatchAsJsonAsync($"/api/users/{moderatorId}/active", new { isActive = true });
    }

    [Fact]
    public async Task Old_token_is_rejected_after_a_role_change_even_though_it_has_not_expired()
    {
        var editorClient = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var (editorId, _) = await GetTestUserAsync(TestUsers.EditorEmail);

        var preChange = await editorClient.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, preChange.StatusCode);

        var adminClient = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var roleChange = await adminClient.PatchAsJsonAsync($"/api/users/{editorId}/role", new { role = "Moderator" });
        Assert.Equal(HttpStatusCode.OK, roleChange.StatusCode);

        var postChange = await editorClient.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, postChange.StatusCode);

        // Cleanup — restore the role so this test doesn't poison the
        // shared per-class database for any test that runs after it.
        await adminClient.PatchAsJsonAsync($"/api/users/{editorId}/role", new { role = "Editor" });
    }

    private async Task<(Guid id, string email)> GetTestUserAsync(string email)
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByEmailAsync(email) ?? throw new InvalidOperationException($"Seeded test user {email} not found.");
        return (user.Id, user.Email!);
    }

    private static string BuildToken(Guid userId, string email, string role, DateTimeOffset issuedAt, DateTimeOffset expires)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, issuedAt.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // No issuer/audience configured for CustomWebApplicationFactory's
        // JwtOptions beyond the default ("musakuce-az" / "musakuce-az-admin"
        // from JwtOptions' own property defaults), so these must match
        // what Program.cs's TokenValidationParameters expects.
        var token = new JwtSecurityToken(
            issuer: "musakuce-az",
            audience: "musakuce-az-admin",
            claims: claims,
            notBefore: issuedAt.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
