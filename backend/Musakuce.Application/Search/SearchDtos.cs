namespace Musakuce.Application.Search;

public record SearchResultItem(Guid Id, string Title, string? Snippet);

/// <summary>
/// Per-module Draft/Archived visibility for a search call — replaces a
/// single global "is staff" flag (Phase 14 §4) so a search result never
/// surfaces unpublished title/snippet text from a module the caller has
/// no view permission for (e.g. a Moderator, who has no People/History/
/// Photos/etc. view permission, must not see Draft People in search just
/// because they're an authenticated staff member).
/// </summary>
public record SearchVisibility(
    bool People,
    bool History,
    bool Photos,
    bool Videos,
    bool Places,
    bool Events,
    bool LocalInfo,
    bool Memorial,
    bool CulturalHeritage,
    bool Interviews,
    bool Education
)
{
    public static readonly SearchVisibility PublicOnly = new(false, false, false, false, false, false, false, false, false, false, false);
}

/// <summary>
/// Phase 12 §13 — covers every content type named in the spec's
/// minimum list. Case-insensitive substring search for MVP, per the
/// plan's decision to defer a dedicated search engine (Meilisearch/
/// Typesense) — this keeps the public contract stable so the
/// implementation can be swapped later without touching callers.
/// </summary>
public record SearchResponse(
    IReadOnlyList<SearchResultItem> People,
    IReadOnlyList<SearchResultItem> History,
    IReadOnlyList<SearchResultItem> Photos,
    IReadOnlyList<SearchResultItem> Videos,
    IReadOnlyList<SearchResultItem> Places,
    IReadOnlyList<SearchResultItem> Events,
    IReadOnlyList<SearchResultItem> LocalInfo,
    IReadOnlyList<SearchResultItem> Memorial,
    IReadOnlyList<SearchResultItem> CulturalHeritage,
    IReadOnlyList<SearchResultItem> Interviews,
    IReadOnlyList<SearchResultItem> Education
);
