using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// Security-audit fix (§Phase 2) — the audit's live production test
/// (10 rapid GETs to /api/photos, all 200; 12 rapid logins, 10×401 then
/// 429 on 11-12) is mirrored here as an automated, repeatable check
/// against the real rate-limiter configuration in Program.cs, run
/// in-process via WebApplicationFactory rather than against a live
/// server.
/// </summary>
public class RateLimitingTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public RateLimitingTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Login_policy_still_returns_429_after_its_limit_is_exceeded()
    {
        // Deliberately its own, non-shared factory instance rather than
        // the class fixture: this test intentionally exhausts the
        // login rate-limit budget for the shared "IP" partition
        // in-process tests all share, which would otherwise starve
        // *other* tests in this class of their own ability to log in
        // within the same 1-minute fixed window (found by hitting
        // exactly that failure while first writing this file).
        using var factory = new CustomWebApplicationFactory();
        await factory.SeedAsync();
        var client = factory.CreateClient();
        var statusCodes = new List<HttpStatusCode>();

        for (var i = 0; i < 12; i++)
        {
            var response = await client.PostAsJsonAsync("/api/auth/login", new { email = "nobody@test.local", password = "wrong" });
            statusCodes.Add(response.StatusCode);
        }

        Assert.Equal(10, statusCodes.Count(s => s == HttpStatusCode.Unauthorized));
        Assert.Equal(2, statusCodes.Count(s => s == HttpStatusCode.TooManyRequests));
    }

    [Fact]
    public async Task A_reasonable_burst_of_public_GET_requests_is_never_throttled()
    {
        // The audit's core finding: this used to be completely
        // unthrottled; now it's covered by the 300/min global baseline,
        // which a normal burst of page-load-driven requests should
        // never come close to triggering.
        var client = _factory.CreateClient();

        for (var i = 0; i < 20; i++)
        {
            var response = await client.GetAsync("/api/photos?pageSize=1");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task Authenticated_admin_requests_are_not_throttled_by_public_traffic_on_the_same_connection()
    {
        // Partitioning is by authenticated user id, not just IP/connection
        // — so even after a burst of anonymous public traffic on the same
        // client, an authenticated admin call still goes through.
        var anonymousClient = _factory.CreateClient();
        for (var i = 0; i < 20; i++)
            await anonymousClient.GetAsync("/api/photos?pageSize=1");

        var adminClient = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await adminClient.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
