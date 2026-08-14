namespace Musakuce.Domain.Enums;

/// <summary>
/// A single Place table serves both the archive's historical places and
/// the village square's practical places — Kind selects which fields are
/// meaningful (spec §5 database schema decision).
/// </summary>
public enum PlaceKind
{
    Historical,
    Useful,
}

public enum PlaceCategory
{
    Mosque,
    Shrine,
    Cemetery,
    School,
    Library,
    Shop,
    Pharmacy,
    Doctor,
    TeaHouse,
    SportsArea,
    Service,
    Other,
}
