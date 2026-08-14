using System.Security.Claims;
using Musakuce.Application.Abstractions;

namespace Musakuce.Api.Auth;

public class HttpCurrentActorContext(IHttpContextAccessor httpContextAccessor) : ICurrentActorContext
{
    private HttpContext? Context => httpContextAccessor.HttpContext;
    private ClaimsPrincipal? User => Context?.User;

    public Guid? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);
    public string? DisplayName => User?.FindFirstValue(ClaimTypes.Name);

    public string? IpAddress => Context?.Connection.RemoteIpAddress?.ToString();
    public string? UserAgent => Context?.Request.Headers.UserAgent.ToString() is { Length: > 0 } ua ? ua : null;
}
