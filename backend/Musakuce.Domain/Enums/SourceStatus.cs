namespace Musakuce.Domain.Enums;

/// <summary>
/// Historical-accuracy status for archive content, per spec §26 — never
/// present oral tradition or unverified material as flat fact.
/// </summary>
public enum SourceStatus
{
    Verified,
    OfficialSource,
    FamilyArchive,
    OralHistory,
    LocalResearch,
    TraditionalStory,
    UnderResearch,
}
