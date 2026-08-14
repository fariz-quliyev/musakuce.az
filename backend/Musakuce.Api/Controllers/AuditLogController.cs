using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Audit;

namespace Musakuce.Api.Controllers;

/// <summary>Admin-only audit trail — spec Phase 7 §6. Administrator only.</summary>
[ApiController]
[Route("api/audit-log")]
[Authorize(Policy = Permissions.AuditLogView)]
public class AuditLogController(IAuditLogService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetPaged([FromQuery] AuditLogQuery query, CancellationToken ct) =>
        Ok(await service.GetPagedAsync(query, ct));
}
