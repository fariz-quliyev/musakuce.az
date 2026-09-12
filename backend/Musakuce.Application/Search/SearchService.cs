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

        // Kept as field.ToLower()…Contains(term) rather than a
        // provider-specific case-insensitive operator (e.g. Postgres
        // ILIKE) — Musakuce.Application deliberately has no dependency on
        // the Npgsql provider (that's Infrastructure's job), and this
        // method must stay swappable across providers per that layering.
        //
        // Both sides fold Azerbaijani's dotted/dotless I family, so any of
        // i / İ / ı / I matches any other: the term through
        // SearchTextNormalizer.FoldIFamily, the columns through the
        // .Replace() pair repeated in every predicate below (a helper call
        // can't be used there — it wouldn't translate to SQL). Without it
        // a query containing "İ" matched nothing at all, and an all-caps
        // word holding "ı" ("KAZIMOV") could never match its stored form.
        //
        // NOTE: the pg_trgm GIN indexes added by the
        // Phase14SearchTrigramIndexes migration are expression indexes on
        // lower(column), so they no longer back these predicates, which
        // now read replace(replace(lower(column), 'ı', 'i'), …). At the
        // archive's current size that is not measurable; if it grows, add
        // matching expression indexes (replace() and lower() are both
        // IMMUTABLE, so they are indexable as-is).
        var term = SearchTextNormalizer.FoldIFamily(query.Trim());

        var people = await db.People
            .Where(p => visibility.People || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.FirstName.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) || p.LastName.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term))
            .OrderBy(p => p.LastName)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, $"{p.FirstName} {p.LastName}", p.Occupation))
            .ToListAsync(ct);

        var history = await db.HistoricalEvents
            .Where(e => visibility.History || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) || e.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term))
            .OrderBy(e => e.DisplayOrder)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Period))
            .ToListAsync(ct);

        var photos = await db.Photos
            .Where(p => visibility.Photos || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (p.Description != null && p.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderByDescending(p => p.CreatedAt)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, p.Title, p.Description))
            .ToListAsync(ct);

        var videos = await db.Videos
            .Where(v => visibility.Videos || v.PublicationStatus == PublicationStatus.Published)
            .Where(v => v.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (v.Description != null && v.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderByDescending(v => v.CreatedAt)
            .Take(MaxResultsPerGroup)
            .Select(v => new SearchResultItem(v.Id, v.Title, v.Description))
            .ToListAsync(ct);

        var places = await db.Places
            .Where(p => visibility.Places || p.PublicationStatus == PublicationStatus.Published)
            .Where(p => p.Name.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (p.Description != null && p.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderBy(p => p.Name)
            .Take(MaxResultsPerGroup)
            .Select(p => new SearchResultItem(p.Id, p.Name, p.Description))
            .ToListAsync(ct);

        var events = await db.VillageEvents
            .Where(e => visibility.Events || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) || e.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term))
            .OrderByDescending(e => e.StartsAt)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Location))
            .ToListAsync(ct);

        var localInfo = await db.LocalInfoEntries
            .Where(e => visibility.LocalInfo || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Name.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (e.Description != null && e.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderBy(e => e.Name)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Name, e.Category))
            .ToListAsync(ct);

        var memorial = await db.MemorialRecords
            .Where(r => visibility.Memorial || r.PublicationStatus == PublicationStatus.Published)
            .Where(r => r.FullName.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term))
            .OrderBy(r => r.FullName)
            .Take(MaxResultsPerGroup)
            .Select(r => new SearchResultItem(r.Id, r.FullName, r.Category.ToString()))
            .ToListAsync(ct);

        var culturalHeritage = await db.CulturalHeritageItems
            .Where(i => visibility.CulturalHeritage || i.PublicationStatus == PublicationStatus.Published)
            .Where(i => i.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) || i.Description.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term))
            .OrderBy(i => i.Title)
            .Take(MaxResultsPerGroup)
            .Select(i => new SearchResultItem(i.Id, i.Title, i.Kind.ToString()))
            .ToListAsync(ct);

        var interviews = await db.Interviews
            .Where(i => visibility.Interviews || i.PublicationStatus == PublicationStatus.Published)
            .Where(i => i.PersonName.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (i.Title != null && i.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderByDescending(i => i.RecordingDate)
            .Take(MaxResultsPerGroup)
            .Select(i => new SearchResultItem(i.Id, i.PersonName, i.Title))
            .ToListAsync(ct);

        var education = await db.EducationEntries
            .Where(e => visibility.Education || e.PublicationStatus == PublicationStatus.Published)
            .Where(e => e.Title.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term) ||
                        (e.Summary != null && e.Summary.ToLower().Replace("ı", "i").Replace("\u0307", "").Contains(term)))
            .OrderBy(e => e.Title)
            .Take(MaxResultsPerGroup)
            .Select(e => new SearchResultItem(e.Id, e.Title, e.Summary))
            .ToListAsync(ct);

        return new SearchResponse(people, history, photos, videos, places, events, localInfo, memorial, culturalHeritage, interviews, education);
    }
}
