using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// "Düzəliş təklif et" — readers propose a correction/addition/photo
/// against an already-existing public content record. Covers: anonymous
/// create is genuinely anonymous and always Pending; a suggestion cannot
/// be filed against a nonexistent target or an unknown content type;
/// an entirely empty suggestion is rejected; listing/reviewing is
/// admin-privileged only; approving/rejecting never mutates the target
/// entity itself (the manual-apply design decision).
/// </summary>
public class CorrectionSuggestionTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public CorrectionSuggestionTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private HttpClient Anonymous() => _factory.CreateClient();

    private async Task<PersonBody> CreatePublishedPersonAsync(HttpClient admin)
    {
        var create = await admin.PostAsJsonAsync("/api/people", new
        {
            firstName = "Original",
            lastName = "Name",
            category = "Teacher",
            biography = "Test biography for correction-suggestion tests.",
            sourceStatus = "Verified",
        });
        create.EnsureSuccessStatusCode();
        var person = (await create.Content.ReadFromJsonAsync<PersonBody>())!;

        var publish = await admin.PatchAsJsonAsync($"/api/people/{person.id}/status", new { publicationStatus = "Published" });
        publish.EnsureSuccessStatusCode();
        return person;
    }

    [Fact]
    public async Task Anonymous_can_submit_a_correction_suggestion_which_starts_Pending()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var person = await CreatePublishedPersonAsync(admin);
        var anonymous = Anonymous();

        var response = await anonymous.PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = person.id,
            suggestedChange = "Doğum tarixi 1930 deyil, 1932 olmalıdır.",
            submitterName = "Test Oxucu",
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = (await response.Content.ReadFromJsonAsync<CorrectionBody>())!;
        Assert.Equal("Pending", created.status);
        Assert.Equal("Original Name", created.targetTitle);
    }

    [Fact]
    public async Task Suggestion_against_a_nonexistent_target_is_rejected()
    {
        var anonymous = Anonymous();

        var response = await anonymous.PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = Guid.NewGuid(),
            suggestedChange = "Bu mövcud olmayan qeydə aiddir.",
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Suggestion_with_an_unknown_target_entity_type_is_rejected()
    {
        var anonymous = Anonymous();

        var response = await anonymous.PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "SomethingNotReal",
            targetEntityId = Guid.NewGuid(),
            suggestedChange = "Test",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task An_entirely_empty_suggestion_is_rejected()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var person = await CreatePublishedPersonAsync(admin);
        var anonymous = Anonymous();

        // No suggestedChange, no additionalNotes, no photo — nothing for
        // a moderator to actually review.
        var response = await anonymous.PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = person.id,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_list_or_view_suggestions()
    {
        var anonymous = Anonymous();

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/corrections")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/corrections/{Guid.NewGuid()}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await anonymous.PatchAsJsonAsync($"/api/corrections/{Guid.NewGuid()}/status", new { status = "Approved" })).StatusCode);
    }

    [Fact]
    public async Task Editor_can_list_view_and_approve_a_suggestion()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var person = await CreatePublishedPersonAsync(admin);

        var create = await Anonymous().PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = person.id,
            suggestedChange = "Peşəsi müəllim deyil, həkim olub.",
        });
        var suggestion = (await create.Content.ReadFromJsonAsync<CorrectionBody>())!;

        var list = await editor.GetFromJsonAsync<PagedBody>("/api/corrections?status=Pending&pageSize=50");
        Assert.Contains(list!.items, item => item.id == suggestion.id);

        var detail = await editor.GetAsync($"/api/corrections/{suggestion.id}");
        Assert.Equal(HttpStatusCode.OK, detail.StatusCode);

        var approve = await editor.PatchAsJsonAsync($"/api/corrections/{suggestion.id}/status", new { status = "Approved" });
        Assert.Equal(HttpStatusCode.OK, approve.StatusCode);
        var approved = (await approve.Content.ReadFromJsonAsync<CorrectionBody>())!;
        Assert.Equal("Approved", approved.status);
    }

    [Fact]
    public async Task Approving_a_suggestion_never_changes_the_target_entity_itself()
    {
        // The confirmed design decision: approval only marks the
        // suggestion reviewed — the reviewer must apply the change
        // manually via the target's own admin form. Proves the backend
        // genuinely does not auto-apply anything.
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var person = await CreatePublishedPersonAsync(admin);

        var create = await Anonymous().PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = person.id,
            suggestedChange = "Ad 'Original' deyil, 'Dəyişdirilmiş' olmalıdır.",
        });
        var suggestion = (await create.Content.ReadFromJsonAsync<CorrectionBody>())!;

        await admin.PatchAsJsonAsync($"/api/corrections/{suggestion.id}/status", new { status = "Approved" });

        var stillOriginal = await admin.GetFromJsonAsync<PersonBody>($"/api/people/{person.id}");
        Assert.Equal("Original", stillOriginal!.firstName);
        Assert.Equal("Name", stillOriginal.lastName);
    }

    [Fact]
    public async Task Moderator_can_reject_a_suggestion_with_a_note()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var moderator = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);
        var person = await CreatePublishedPersonAsync(admin);

        var create = await Anonymous().PostAsJsonAsync("/api/corrections", new
        {
            targetEntityType = "Person",
            targetEntityId = person.id,
            suggestedChange = "Yanlış təklif.",
        });
        var suggestion = (await create.Content.ReadFromJsonAsync<CorrectionBody>())!;

        var reject = await moderator.PatchAsJsonAsync(
            $"/api/corrections/{suggestion.id}/status",
            new { status = "Rejected", reviewerNote = "Mənbə təsdiqlənmədi." });

        Assert.Equal(HttpStatusCode.OK, reject.StatusCode);
        var rejected = (await reject.Content.ReadFromJsonAsync<CorrectionBody>())!;
        Assert.Equal("Rejected", rejected.status);
        Assert.Equal("Mənbə təsdiqlənmədi.", rejected.reviewerNote);
    }

    private record PersonBody(Guid id, string firstName, string lastName);
    private record CorrectionBody(Guid id, string targetTitle, string status, string? reviewerNote);
    private record PagedItem(Guid id);
    private record PagedBody(List<PagedItem> items);
}
