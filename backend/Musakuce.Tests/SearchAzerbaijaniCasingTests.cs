using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;
using Musakuce.Application.Search;
using Musakuce.Infrastructure.Data;

namespace Musakuce.Tests;

/// <summary>
/// Azerbaijani case-insensitive search. The alphabet's dotted/dotless I
/// pair used to break search in two ways: a query containing "İ" matched
/// nothing at all (.NET lowercases it to "i" plus a combining dot above,
/// which never equals Postgres' plain "i"), and an all-caps word holding
/// "ı" could not match its stored form ("I" lowercases to "i", not "ı").
/// SearchService now folds the whole i family on both sides.
///
/// Rows are seeded straight into the test database rather than created
/// over HTTP: the theory below would otherwise log in once per case and
/// trip the login rate limiter.
/// </summary>
public class SearchAzerbaijaniCasingTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public SearchAzerbaijaniCasingTests(CustomWebApplicationFactory factory) => _factory = factory;

    private static readonly string[] Titles =
    [
        "İlk məktəb",
        "Kazımov haqqında",
        "Şəhidlərimizin xatirəsi",
        "Çörəkçi ustalar",
        "Ağac üzərində oyma",
        "Üzüm bağları",
        "Məscidin tikilməsi",
    ];

    public async Task InitializeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        if (db.HistoricalEvents.Any(e => Titles.Contains(e.Title))) return;

        db.HistoricalEvents.AddRange(Titles.Select((title, i) => new HistoricalEvent
        {
            Title = title,
            Period = "1930-cu illər",
            Description = "Axtarış testi üçün qeyd",
            SourceStatus = SourceStatus.Verified,
            PublicationStatus = PublicationStatus.Published,
            DisplayOrder = i,
        }));
        await db.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private async Task<bool> AnonymousSearchFindsAsync(string query, string title)
    {
        var anonymous = _factory.CreateClient();
        var result = await anonymous.GetFromJsonAsync<SearchBody>($"/api/search?q={Uri.EscapeDataString(query)}");
        return result!.history.Any(item => item.title == title);
    }

    [Theory]
    // The letter that used to return nothing, in every case variant.
    [InlineData("İlk məktəb", "İlk")]
    [InlineData("İlk məktəb", "ilk")]
    [InlineData("İlk məktəb", "İLK")]
    [InlineData("İlk məktəb", "ILK")]
    // "I" is the capital of "ı" in Azerbaijani, so all-caps must still match.
    [InlineData("Kazımov haqqında", "Kazımov")]
    [InlineData("Kazımov haqqında", "KAZIMOV")]
    [InlineData("Kazımov haqqında", "kazımov")]
    // The remaining Azerbaijani letters, upper and lower case.
    [InlineData("Şəhidlərimizin xatirəsi", "şəhid")]
    [InlineData("Şəhidlərimizin xatirəsi", "ŞƏHİD")]
    [InlineData("Çörəkçi ustalar", "çörək")]
    [InlineData("Çörəkçi ustalar", "ÇÖRƏK")]
    [InlineData("Ağac üzərində oyma", "ağac")]
    [InlineData("Ağac üzərində oyma", "AĞAC")]
    [InlineData("Üzüm bağları", "üzüm")]
    [InlineData("Üzüm bağları", "ÜZÜM")]
    public async Task Search_matches_regardless_of_Azerbaijani_letter_case(string title, string query)
        => Assert.True(await AnonymousSearchFindsAsync(query, title), $"'{query}' did not match '{title}'");

    [Fact]
    public async Task Search_still_excludes_records_that_do_not_contain_the_term()
        => Assert.False(await AnonymousSearchFindsAsync("qəbristanlıq", "Məscidin tikilməsi"));

    // The Postgres-only half of the bug: lower() there returns a plain
    // "i" for "İ" and "i" for "I", so the term must arrive already folded
    // the same way. These assertions are what the InMemory integration
    // theory above cannot cover, since .NET casing applies on both sides
    // there and the mismatch never appears.
    [Theory]
    [InlineData("İlk", "ilk")]
    [InlineData("İLK", "ilk")]
    [InlineData("ILK", "ilk")]
    [InlineData("ilk", "ilk")]
    [InlineData("Kazımov", "kazimov")]
    [InlineData("KAZIMOV", "kazimov")]
    [InlineData("QƏBRİSTANLIQ", "qəbristanliq")]
    [InlineData("ŞƏHİD", "şəhid")]
    [InlineData("ÇÖRƏKÇİ", "çörəkçi")]
    [InlineData("AĞAC ÜZƏRİNDƏ", "ağac üzərində")]
    public void Fold_maps_the_whole_i_family_to_plain_i_and_lowercases_the_rest(string input, string expected)
    {
        var folded = SearchTextNormalizer.FoldIFamily(input);
        Assert.Equal(expected, folded);
        Assert.DoesNotContain('̇', folded); // no leftover combining dot
        Assert.DoesNotContain('ı', folded);
    }

    // The same folding backs every list endpoint's ?search= box (admin
    // tables and the public browsers alike), not just /api/search.
    [Theory]
    [InlineData("İlk")]
    [InlineData("ILK")]
    [InlineData("ilk")]
    public async Task List_endpoint_search_matches_regardless_of_case(string query)
    {
        var anonymous = _factory.CreateClient();
        var page = await anonymous.GetFromJsonAsync<PagedBody>(
            $"/api/history?search={Uri.EscapeDataString(query)}&pageSize=50");
        Assert.Contains(page!.items, item => item.title == "İlk məktəb");
    }

    private record SearchItem(Guid id, string title, string? snippet);
    private record SearchBody(List<SearchItem> history);
    private record PagedBody(List<SearchItem> items);
}
