using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;

namespace Musakuce.Application.Audit;

public class AuditLogService(IMusakuceDbContext db, ICurrentActorContext actor, ILogger<AuditLogService> logger) : IAuditLogService
{
    public async Task LogAsync(
        string action,
        string? entityType = null,
        string? entityId = null,
        string? oldValue = null,
        string? newValue = null,
        CancellationToken ct = default)
    {
        try
        {
            db.AuditLogEntries.Add(new AuditLogEntry
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                OldValue = oldValue,
                NewValue = newValue,
                ActorUserId = actor.UserId,
                ActorEmail = actor.Email,
                ActorDisplayName = actor.DisplayName,
                IpAddress = actor.IpAddress,
                UserAgent = actor.UserAgent,
            });
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            // Audit logging must never break the underlying admin action.
            logger.LogError(ex, "Failed to write audit log entry for action {Action}", action);
        }
    }

    public async Task<PagedResult<AuditLogEntryDto>> GetPagedAsync(AuditLogQuery query, CancellationToken ct = default)
    {
        var entries = db.AuditLogEntries.AsNoTracking().AsQueryable();

        if (query.ActorUserId is not null)
            entries = entries.Where(e => e.ActorUserId == query.ActorUserId);
        if (!string.IsNullOrWhiteSpace(query.Action))
            entries = entries.Where(e => e.Action == query.Action);
        if (!string.IsNullOrWhiteSpace(query.EntityType))
            entries = entries.Where(e => e.EntityType == query.EntityType);
        if (query.From is not null)
            entries = entries.Where(e => e.Timestamp >= query.From);
        if (query.To is not null)
            entries = entries.Where(e => e.Timestamp <= query.To);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            entries = entries.Where(e => (e.ActorEmail ?? "").ToLower().Contains(term) || (e.EntityId ?? "").ToLower().Contains(term));
        }

        entries = entries.OrderByDescending(e => e.Timestamp);

        var totalCount = await entries.CountAsync(ct);
        var items = await entries
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<AuditLogEntryDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    private static AuditLogEntryDto ToDto(AuditLogEntry e) => new(
        e.Id, e.Timestamp, e.ActorUserId, e.ActorEmail, e.ActorDisplayName, e.Action,
        e.EntityType, e.EntityId, e.OldValue, e.NewValue, e.IpAddress, e.UserAgent);
}
