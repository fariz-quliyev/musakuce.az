using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Musakuce.Tests;

public static class TestAuthHelper
{
    public static async Task<string> LoginAsync(HttpClient client, string email)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password = TestUsers.Password });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<LoginResponseShape>();
        return body!.token;
    }

    public static async Task<HttpClient> AsRoleAsync(this CustomWebApplicationFactory factory, string email)
    {
        var client = factory.CreateClient();
        var token = await LoginAsync(client, email);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private record LoginResponseShape(string token, DateTimeOffset expiresAt);
}
