namespace Musakuce.Application.Timeline;

public record TimelineSettingsDto(
    Guid Id,
    string Title,
    string Subtitle,
    bool IsActive,
    int? MaxEventsDesktop,
    string DefaultSelection,
    string MobileBehavior
);

/// <summary>ADMIN-PRIVILEGED — always upserts the single timeline-settings
/// row; there is no separate Create.</summary>
public class UpsertTimelineSettingsRequest
{
    public required string Title { get; set; }
    public required string Subtitle { get; set; }
    public bool IsActive { get; set; } = true;
    public int? MaxEventsDesktop { get; set; }
    public string DefaultSelection { get; set; } = "First";
    public string MobileBehavior { get; set; } = "HorizontalScroll";
}
