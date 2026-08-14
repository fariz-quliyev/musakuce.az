using Microsoft.AspNetCore.Identity;

namespace Musakuce.Infrastructure.Identity;

/// <summary>
/// Admin/CMS staff account — Phase 7. There is deliberately no public
/// user-account system; every ApplicationUser is a staff member with one
/// of the four admin roles (Administrator/Editor/Archivist/Moderator).
/// "Disabled" is modeled via Identity's built-in lockout
/// (LockoutEnd = far future), not a separate IsActive flag.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public required string DisplayName { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
