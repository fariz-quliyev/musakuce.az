namespace Musakuce.Api.Auth;

public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public record CurrentUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions
);

public record LoginResponse(
    string Token,
    DateTimeOffset ExpiresAt,
    CurrentUserDto User
);
