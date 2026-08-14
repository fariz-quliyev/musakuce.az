using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Search;

public class SearchService(IMusakuceDbContext db) : ISearchService
{
    private const int MaxResultsPerGroup = 8;

    public async Task<SearchResponse> SearchAsync(string query, SearchVisibility visibility, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new SearchResponse([], [], [], [], [], [], [], [], [], [], []);

        // Kept as field.ToLower().Contains(term) rather than a
        // provider-specific case-insensitive operator (e.g. Postgres
        // ILIKE) — Musakuce.Application deliberately has no dependency on
        // the Npgsql provider (that's Infrastructure's job), and this
        // method must stay swappable across providers per that layering.
        // The matching pg_trgm GIN indexes (see the entity Configuration
        // classes in Infrastructure) are built as expression indexes on
        // lower(column) specifically so they still back this exact query
        // shape — see the migration's doc comment for details.
        var term = query.Trim().ToLower();

        var people = await db.People
            .Where(p => visibility.People || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.FirstName.ToLower().Contains(term) || p.LastName.ToLower().Contains(term))
            .OrderBy(p => p.LastName)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, $"{p.FirstName} {p.LastName}", p.Occupation))
            .ToListAsync(ct);

        var history = await db.HistoricalEvents
            .Where(e => visibility.History || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Contains(term) || e.Description.ToLower().Contains(term))
            .OrderBy(e => e.DisplayOrder)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Period))
            .ToListAsync(ct);

        var photos = await db.Photos
            .Where(p => visibility.Photos || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.Title.ToLower().Contains(term) ||
                        (p.Description != null && p.Description.ToLower().Contains(term)))
            .OrderByDescending(p => p.CreatedAt)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, p.Title, p.Description))
            .ToListAsync(ct);

        var videos = await db.Videos
            .Where(v => visibility.Videos || v.PublicationStatus == PublicationStatus.Published)
            .Where(v => v.Title.ToLower().Contains(term) ||
                        (v.Description != null && v.Description.ToLower().Contains(term)))
            .OrderByDescending(v => v.CreatedAt)
            .Take(MaxResultsPerGroup)
            .Select(v => new SearchResultItem(v.Id, v.Title, v.Description))
            .ToListAsync(ct);

        var places = await db.Places
            .Where(p => visibility.Places || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.Name.ToLower().Contains(term) ||
                        (p.Description != null && p.Description.ToLower().Contains(term)))
            .OrderBy(p => p.Name)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, p.Name, p.Description))
            .ToListAsync(ct);

        var events = await db.VillageEvents
            .Where(e => visibility.Events || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Contains(term) || e.Description.ToLower().Contains(term))
            .OrderByDescending(e => e.StartsAt)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Location))
            .ToListAsync(ct);

        var localInfo = await db.LocalInfoEntries
            .Where(e => visibility.LocalInfo || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Name.ToLower().Contains(term) ||
                        (e.Description != null && e.Description.ToLower().Contains(term)))
            .OrderBy(e => e.Name)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Name, e.Category))
            .ToListAsync(ct);

        var memorial = await db.MemorialRecords
            .Where(r => visibility.Memorial || r.PublicationStatus == PublicationStatus.Published)
            .Where(r => r.FullName.ToLower().Contains(term))
            .OrderBy(r => r.FullName)
            .Take(MaxResultsPerGroup)
            .Select(r => new SearchResultItem(r.Id, r.FullName, r.Category.ToString()))
            .ToListAsync(ct);

        var culturalHeritage = await db.CulturalHeritageItems
            .Where(i => visibility.CulturalHeritage || i.PublicationStatus == PublicationStatus.Published)
            .Where(i => i.Title.ToLower().Contains(term) || i.Description.ToLower().Contains(term))
            .OrderBy(i => i.Title)
            .Take(MaxResultsPerGroup)
            .Select(i => new SearchResultItem(i.Id, i.Title, i.Kind.ToString()))
            .ToListAsync(ct);

        var interviews = await db.Interviews
            .Where(i => visibility.Interviews || i.PublicationStatus == PublicationStatus.Published)
            .Where(i => i.PersonName.ToLower().Contains(term) ||
                        (i.Title != null && i.Title.ToLower().Contains(term)))
            .OrderByDescending(i => i.RecordingDate)
            .Take(MaxResultsPerGroup)
            .Select(i => new SearchResultItem(i.Id, i.PersonName, i.Title))
            .ToListAsync(ct);

        var education = await db.EducationEntries
            .Where(e => visibility.Education || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Contains(term) ||
                        (e.Summary != null && e.Summary.ToLower().Contains(term)))
            .OrderBy(e => e.Title)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Summary))
            .ToListAsync(ct);

        return new SearchResponse(people, history, photos, videos, places, events, localInfo, memorial, culturalHeritage, interviews, education);
    }
}
