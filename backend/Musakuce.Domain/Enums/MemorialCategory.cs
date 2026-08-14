namespace Musakuce.Domain.Enums;

/// <summary>"Xatirə" — Phase 12 §E. One unified entity for every kind of
/// memorial record rather than a separate table per category, mirroring
/// the Place (Kind/Category) and Person (Category) pattern.</summary>
public enum MemorialCategory
{
    WWIIParticipant,
    WWIIFallen,
    KarabakhMartyr,
    KarabakhParticipant,
    WarDisabled,
    ChernobylDisabled,
    LaborHero,
    SocialistLaborHero,
    Other,
}
