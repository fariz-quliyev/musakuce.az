using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Api.Auth;

public interface IJwtTokenService
{
    (string token, DateTimeOffset expiresAt) GenerateToken(ApplicationUser user, IList<string> roles);
}

public class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    public (string token, DateTimeOffset expiresAt) GenerateToken(ApplicationUser user, IList<string> roles)
    {
        var opts = options.Value;
        if (string.IsNullOrWhiteSpace(opts.Secret))
            throw new InvalidOperationException("Jwt:Secret is not configured.");

        var expiresAt = DateTimeOffset.UtcNow.AddHours(opts.ExpiryHours);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.DisplayName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            audience: opts.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
