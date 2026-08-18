using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Domain.Entities;

namespace Musakuce.Application.Timeline;

/// <summary>Singleton content type — at most one row ever exists. Same
/// FirstOrDefaultAsync-with-no-filter pattern as VillageProfileService.</summary>
public class TimelineSettingsService(IMusakuceDbContext db, IAuditLogService auditLog) : ITimelineSettingsService
{
    public async Task<TimelineSettingsDto?> GetAsync(CancellationToken ct = default)
    {
        var settings = await db.TimelineSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        return settings is null ? null : ToDto(settings);
    }

    public async Task<TimelineSettingsDto> UpsertAsync(UpsertTimelineSettingsRequest request, CancellationToken ct = default)
    {
        var settings = await db.TimelineSettings.FirstOrDefaultAsync(ct);
        var isNew = settings is null;
        settings ??= new TimelineSettings();

        settings.Title = request.Title;
        settings.Subtitle = request.Subtitle;
        settings.IsActive = request.IsActive;
        settings.MaxEventsDesktop = request.MaxEventsDesktop;
        settings.DefaultSelection = request.DefaultSelection;
        settings.MobileBehavior = request.MobileBehavior;
        settings.UpdatedAt = DateTimeOffset.UtcNow;

        if (isNew) db.TimelineSettings.Add(settings);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync(isNew ? "Create" : "Update", nameof(TimelineSettings), settings.Id.ToString(), newValue: settings.Title, ct: ct);
        return ToDto(settings);
    }

    private static TimelineSettingsDto ToDto(TimelineSettings s) => new(
        s.Id, s.Title, s.Subtitle, s.IsActive, s.MaxEventsDesktop, s.DefaultSelection, s.MobileBehavior);
}
