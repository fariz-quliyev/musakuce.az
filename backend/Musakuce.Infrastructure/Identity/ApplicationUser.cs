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

    /// <summary>
    /// Security-audit fix (§Phase 4) — JWTs here are stateless with no
    /// server-side session table, so there was previously no way to
    /// invalidate an already-issued token before it naturally expired
    /// (up to Jwt:ExpiryHours later). Any token whose `iat` (issued-at)
    /// claim predates this timestamp is rejected on its next use — see
    /// Program.cs's JwtBearerEvents.OnTokenValidated. Bumped to "now" on
    /// logout, password reset, role change, and account disable (see
    /// AuthController.Logout and UsersController's SetActive/AssignRole/
    /// ResetPassword). Null means "no revocation has ever happened for
    /// this user" — every existing token stays valid, so this is a
    /// purely additive change for accounts that never trigger any of
    /// those actions again.
    /// </summary>
    public DateTimeOffset? TokensValidAfter { get; set; }
}
