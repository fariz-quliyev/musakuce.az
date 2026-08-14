namespace Musakuce.Application.Abstractions;

/// <summary>
/// Decouples audit logging (Application layer) from HttpContext (Api
/// layer) — implemented in Musakuce.Api via IHttpContextAccessor.
/// All members are null when there is no authenticated actor (e.g. the
/// anonymous public listing/submission endpoints).
/// </summary>
public interface ICurrentActorContext
{
    Guid? UserId { get; }
    string? Email { get; }
    string? DisplayName { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
}
