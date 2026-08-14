namespace Musakuce.Domain.Enums;

/// <summary>
/// Unified "Yerli Faydalı Məlumatlar" kinds (spec §11) — replaces the
/// earlier separate ServiceProvider/LocalContact/Recommendation design.
/// </summary>
public enum LocalInfoKind
{
    Service,
    Contact,
    Shop,
    Craftsman,
    Transport,
    Recommendation,
}
