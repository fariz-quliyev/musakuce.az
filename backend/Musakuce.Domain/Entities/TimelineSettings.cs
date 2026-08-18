using Musakuce.Domain.Common;

namespace Musakuce.Domain.Entities;

/// <summary>
/// Singleton settings row for the "Zaman xəttində Musaküçə" timeline on
/// /kendimiz — same singleton pattern as VillageProfile (one row, no
/// PublicationStatus/publish step, upserted in place). Separate from
/// HistoricalEvent (the individual timeline points) because these are
/// section-level display settings, not content.
/// </summary>
public class TimelineSettings : BaseEntity
{
    public string Title { get; set; } = "Zaman xəttində Musaküçə";
    public string Subtitle { get; set; } =
        "Nəsildən-nəslə ötürülən xatirələr, hadisələr və insanların zəhməti ilə bu günümüzə gəlib çatan Musaküçənin tarixi.";
    public bool IsActive { get; set; } = true;
    /// <summary>Null = show every active/published event, no cap.</summary>
    public int? MaxEventsDesktop { get; set; }
    /// <summary>"First" or "Last" — which event is pre-selected when the
    /// timeline first renders.</summary>
    public string DefaultSelection { get; set; } = "First";
    /// <summary>Reserved for a future alternate mobile layout. Only
    /// "HorizontalScroll" is implemented today; the column exists so a
    /// later mobile behaviour doesn't need another migration.</summary>
    public string MobileBehavior { get; set; } = "HorizontalScroll";
}
