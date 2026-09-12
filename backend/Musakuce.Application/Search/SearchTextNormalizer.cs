namespace Musakuce.Application.Search;

/// <summary>
/// Normalisation shared by the search term and the columns it is matched
/// against (see SearchService).
/// </summary>
public static class SearchTextNormalizer
{
    /// <summary>
    /// Folds Azerbaijani's dotted/dotless I pair so any of i / İ / ı / I
    /// matches any other.
    ///
    /// Two separate problems make this necessary:
    /// <list type="bullet">
    /// <item>.NET lowercases "İ" (U+0130) to "i" followed by a combining
    /// dot above (U+0307), while Postgres' lower() returns a plain "i" —
    /// so a query containing "İ" previously matched nothing at all. This
    /// only shows up against Postgres: under the EF InMemory provider
    /// both sides get .NET's casing and appear to agree.</item>
    /// <item>In Azerbaijani "I" is the capital of "ı", but lower() maps it
    /// to "i", so an all-caps "KAZIMOV" could never match "Kazımov".</item>
    /// </list>
    /// </summary>
    public static string FoldIFamily(string value) =>
        value.Replace('İ', 'i').Replace('I', 'i').Replace('ı', 'i')
             .ToLowerInvariant()
             .Replace("\u0307", "");
}
