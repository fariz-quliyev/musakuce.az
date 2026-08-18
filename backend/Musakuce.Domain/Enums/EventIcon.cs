namespace Musakuce.Domain.Enums;

/// <summary>
/// Admin-selected visual category for a HistoricalEvent's timeline
/// marker — deliberately a fixed enum picked by the editor, never
/// inferred from Title/Description text at render time (that kind of
/// keyword-matching hack would silently mislabel events the moment a
/// title didn't contain the expected word).
/// </summary>
public enum EventIcon
{
    Settlement,
    Religion,
    Education,
    People,
    War,
    Agriculture,
    Achievement,
    Flag,
    Culture,
    Document,
    General,
}
