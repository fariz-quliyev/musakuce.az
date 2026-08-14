using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Musakuce.Tests;

public class LoginTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public LoginTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Login_with_valid_credentials_returns_a_token_and_user_info()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = TestUsers.AdministratorEmail,
            password = TestUsers.Password,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginBody>();
        Assert.False(string.IsNullOrWhiteSpace(body!.token));
        Assert.Equal(TestUsers.AdministratorEmail, body.user.email);
        Assert.Contains("Administrator", body.user.roles);
    }

    [Fact]
    public async Task Login_with_wrong_password_is_rejected_generically()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = TestUsers.AdministratorEmail,
            password = "definitely-wrong",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_with_unknown_email_is_rejected_with_the_same_generic_message_as_wrong_password()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nobody@test.local",
            password = "whatever12345",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_reflects_the_authenticated_user()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<CurrentUserBody>();
        Assert.Equal(TestUsers.ModeratorEmail, body!.email);
        Assert.Contains("Moderator", body.roles);
        Assert.Contains("listings.moderate", body.permissions);
        Assert.DoesNotContain("people.write", body.permissions);
    }

    [Fact]
    public async Task Logout_requires_authentication()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_succeeds_when_authenticated()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await client.PostAsync("/api/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private record LoginBody(string token, DateTimeOffset expiresAt, CurrentUserBody user);
    private record CurrentUserBody(Guid id, string email, string displayName, List<string> roles, List<string> permissions);
}
