namespace Musakuce.Api.Users;

public record AdminUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    IReadOnlyList<string> Roles,
    bool IsLockedOut,
    DateTimeOffset CreatedAt
);

/// <summary>ADMIN-PRIVILEGED — Administrator only. No public registration exists.</summary>
public class CreateUserRequest
{
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required string Role { get; set; }
    public required string TemporaryPassword { get; set; }
}

public class AssignRoleRequest
{
    public required string Role { get; set; }
}

public class SetActiveRequest
{
    public required bool IsActive { get; set; }
}

public class ResetPasswordRequest
{
    public required string NewPassword { get; set; }
}
