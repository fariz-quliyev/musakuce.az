namespace Musakuce.Application.Timeline;

public interface ITimelineSettingsService
{
    /// <summary>Never null in practice once the AddHistoryTimelineFeature
    /// migration's seed row exists, but nullable to stay honest about the
    /// singleton-may-not-exist-yet case (mirrors IVillageProfileService).</summary>
    Task<TimelineSettingsDto?> GetAsync(CancellationToken ct = default);
    /// <summary>ADMIN-PRIVILEGED.</summary>
    Task<TimelineSettingsDto> UpsertAsync(UpsertTimelineSettingsRequest request, CancellationToken ct = default);
}
