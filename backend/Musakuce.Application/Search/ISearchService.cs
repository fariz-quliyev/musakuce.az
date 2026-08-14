namespace Musakuce.Application.Search;

public interface ISearchService
{
    /// <summary>
    /// <paramref name="visibility"/> lets an authenticated staff member
    /// search Draft/Archived content too (Phase 12 §13), scoped per module
    /// to their actual view permissions (Phase 14 §4) — a caller with only
    /// e.g. Listings/LocalInfo permissions must not see unpublished People
    /// or History results just for being authenticated.
    /// </summary>
    Task<SearchResponse> SearchAsync(string query, SearchVisibility visibility, CancellationToken ct = default);
}
