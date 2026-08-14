namespace Musakuce.Api.Auth;

/// <summary>
/// Bound from the "Jwt" configuration section. Secret MUST come from
/// environment variables / secure configuration in any real deployment —
/// see Program.cs for the fail-closed check in non-Development
/// environments. Never hard-code a real secret here or in appsettings.
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string? Secret { get; set; }
    public string Issuer { get; set; } = "musakuce-az";
    public string Audience { get; set; } = "musakuce-az-admin";
    public int ExpiryHours { get; set; } = 12;
}
