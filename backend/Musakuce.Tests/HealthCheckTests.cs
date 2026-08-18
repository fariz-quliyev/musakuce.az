using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// Security-audit fix (§Phase 10) — /health (liveness) stays DB-
/// independent by design; /health/ready is the new addition, and this
/// only covers the "database is reachable" path (the WebApplicationFactory
/// always has a working InMemory provider) — a real "Postgres is down"
/// scenario isn't something this in-process test host can simulate, so
/// that path was verified by code review of MusakuceDbContext.Database.
/// CanConnectAsync's documented failure behavior instead (see the audit
/// report's Security Verification section).
/// </summary>
public class HealthCheckTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public HealthCheckTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Liveness_endpoint_is_public_and_does_not_require_a_database()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.Equal("ok", body!["status"]);
    }

    [Fact]
    public async Task Readiness_endpoint_reports_ok_when_the_database_is_reachable()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health/ready");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.Equal("ok", body!["status"]);
        Assert.Equal("reachable", body["database"]);
    }
}

/// <summary>
/// Security-audit fix (§Phase 1) — asserts the headers SecurityHeadersMiddleware
/// adds are actually present on a real response from the full pipeline
/// (not just that the middleware class compiles). Runs against
/// WebApplicationFactory's real HTTP pipeline, which is a stronger check
/// than a manual local `dotnet run` + curl would have been — this app
/// requires a real Postgres connection to fully boot outside tests
/// (confirmed while attempting exactly that manual check), which
/// CustomWebApplicationFactory avoids entirely via its InMemory provider.
/// </summary>
public class SecurityHeadersTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public SecurityHeadersTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Every_response_carries_the_expected_security_headers()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health");

        Assert.Equal("max-age=31536000; includeSubDomains", response.Headers.GetValues("Strict-Transport-Security").Single());
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("strict-origin-when-cross-origin", response.Headers.GetValues("Referrer-Policy").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        Assert.Contains("camera=()", response.Headers.GetValues("Permissions-Policy").Single());
        Assert.Equal("default-src 'none'; frame-ancestors 'none'", response.Headers.GetValues("Content-Security-Policy").Single());
    }

    [Fact]
    public async Task Security_headers_are_present_even_on_an_unauthorized_response()
    {
        // Confirms the headers are set unconditionally early in the
        // pipeline, not only on the "happy path" — an attacker probing
        // for a header-bypassing edge case (e.g. via a 401) finds none.
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.True(response.Headers.Contains("Strict-Transport-Security"));
        Assert.True(response.Headers.Contains("Content-Security-Policy"));
    }
}
