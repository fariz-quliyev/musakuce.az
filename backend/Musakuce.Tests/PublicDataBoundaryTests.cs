using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// Phase 7 §10/§4 CRITICAL requirement: Draft/Pending content must never
/// be visible through the public (unauthenticated, default-filter) GET
/// endpoints, and must be visible to an authenticated, permitted admin.
/// </summary>
public class PublicDataBoundaryTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public PublicDataBoundaryTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task A_newly_created_event_defaults_to_draft_and_is_invisible_to_the_public()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var createResponse = await admin.PostAsJsonAsync("/api/events", new
        {
            title = "PUBLIC-BOUNDARY-TEST",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<EventBody>();
        Assert.Equal("Draft", created!.publicationStatus);

        // Public, anonymous, default-filter list must not contain it.
        var anonymous = _factory.CreateClient();
        var publicList = await anonymous.GetFromJsonAsync<PagedBody>("/api/events?pageSize=200");
        Assert.DoesNotContain(publicList!.items, item => item.id == created.id);

        // Public GetById with no status override must 404, not leak it.
        var publicDetail = await anonymous.GetAsync($"/api/events/{created.id}");
        Assert.Equal(HttpStatusCode.NotFound, publicDetail.StatusCode);

        // Admin explicitly requesting Draft can see it.
        var adminDetail = await admin.GetAsync($"/api/events/{created.id}?publicationStatus=Draft");
        Assert.Equal(HttpStatusCode.OK, adminDetail.StatusCode);

        // Once published, it becomes publicly visible.
        var publish = await admin.PatchAsJsonAsync($"/api/events/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var publicListAfterPublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/events?pageSize=200");
        Assert.Contains(publicListAfterPublish!.items, item => item.id == created.id);
    }

    [Fact]
    public async Task A_pending_listing_is_invisible_to_the_public_but_visible_to_a_permitted_admin()
    {
        var moderator = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);

        var createResponse = await moderator.PostAsync("/api/listings", JsonContent.Create(new
        {
            title = "PUBLIC-BOUNDARY-TEST-LISTING",
            description = "test",
            category = "AlqiSatqi",
            location = "Test",
            contactName = "Test",
            contactInfo = "test@example.com",
        }));
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ListingBody>();
        Assert.Equal("Pending", created!.moderationStatus);

        var anonymous = _factory.CreateClient();
        var publicList = await anonymous.GetFromJsonAsync<PagedBody>("/api/listings?pageSize=200");
        Assert.DoesNotContain(publicList!.items, item => item.id == created.id);

        var adminView = await moderator.GetFromJsonAsync<PagedBody>("/api/listings?moderationStatus=Pending&pageSize=200");
        Assert.Contains(adminView!.items, item => item.id == created.id);
    }

    [Fact]
    public async Task A_newly_created_place_defaults_to_draft_and_is_invisible_to_the_public()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var createResponse = await admin.PostAsJsonAsync("/api/places", new
        {
            name = "PUBLIC-BOUNDARY-TEST-PLACE",
            kind = "Useful",
            category = "Shop",
            latitude = 39.00861,
            longitude = 48.69889,
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<EventBody>();
        Assert.Equal("Draft", created!.publicationStatus);

        // Public, anonymous, default-filter list must not contain it.
        var anonymous = _factory.CreateClient();
        var publicList = await anonymous.GetFromJsonAsync<PagedBody>("/api/places?pageSize=200");
        Assert.DoesNotContain(publicList!.items, item => item.id == created.id);

        // Public GetById with no status override must 404, not leak it.
        var publicDetail = await anonymous.GetAsync($"/api/places/{created.id}");
        Assert.Equal(HttpStatusCode.NotFound, publicDetail.StatusCode);

        // Admin explicitly requesting Draft can see it.
        var adminDetail = await admin.GetAsync($"/api/places/{created.id}?publicationStatus=Draft");
        Assert.Equal(HttpStatusCode.OK, adminDetail.StatusCode);

        // Once published, it becomes publicly visible — this is the
        // exact chain the public /xerite map relies on.
        var publish = await admin.PatchAsJsonAsync($"/api/places/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var publicListAfterPublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/places?pageSize=200");
        Assert.Contains(publicListAfterPublish!.items, item => item.id == created.id);

        // Archiving removes it from the public map again.
        var archive = await admin.PatchAsJsonAsync($"/api/places/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);

        var publicListAfterArchive = await anonymous.GetFromJsonAsync<PagedBody>("/api/places?pageSize=200");
        Assert.DoesNotContain(publicListAfterArchive!.items, item => item.id == created.id);
    }

    [Fact]
    public async Task A_newly_created_memorial_record_defaults_to_draft_and_is_invisible_to_the_public()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var createResponse = await admin.PostAsJsonAsync("/api/memorial", new
        {
            fullName = "PUBLIC-BOUNDARY-TEST-MEMORIAL",
            category = "WWIIParticipant",
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<EventBody>();
        Assert.Equal("Draft", created!.publicationStatus);

        var anonymous = _factory.CreateClient();
        var publicList = await anonymous.GetFromJsonAsync<PagedBody>("/api/memorial?pageSize=200");
        Assert.DoesNotContain(publicList!.items, item => item.id == created.id);

        var publicDetail = await anonymous.GetAsync($"/api/memorial/{created.id}");
        Assert.Equal(HttpStatusCode.NotFound, publicDetail.StatusCode);

        var publish = await admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var publicListAfterPublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/memorial?pageSize=200");
        Assert.Contains(publicListAfterPublish!.items, item => item.id == created.id);
    }

    [Fact]
    public async Task Education_entry_lifecycle_respects_publication_boundary_editorial_privacy_and_search()
    {
        var admin = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var createResponse = await admin.PostAsJsonAsync("/api/education", new
        {
            title = "PUBLIC-BOUNDARY-TEST-EDUCATION",
            kind = "FirstSchool",
            summary = "test summary",
            editorialNote = "SECRET-EDITORIAL-NOTE",
            originalSourceText = "SECRET-ORIGINAL-TEXT",
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<EducationBody>();
        Assert.Equal("Draft", created!.publicationStatus);

        var anonymous = _factory.CreateClient();

        // Draft: invisible to the public list/detail, and search.
        var publicList = await anonymous.GetFromJsonAsync<PagedBody>("/api/education?pageSize=200");
        Assert.DoesNotContain(publicList!.items, item => item.id == created.id);
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/education/{created.id}")).StatusCode);
        var searchBeforePublish = await anonymous.GetFromJsonAsync<SearchBody>("/api/search?q=PUBLIC-BOUNDARY-TEST-EDUCATION");
        Assert.DoesNotContain(searchBeforePublish!.education, item => item.id == created.id);

        // Admin can see the Draft, including the editorial-only fields.
        var adminDetail = await admin.GetFromJsonAsync<EducationDetailBody>($"/api/education/{created.id}?publicationStatus=Draft");
        Assert.Equal("SECRET-EDITORIAL-NOTE", adminDetail!.editorialNote);
        Assert.Equal("SECRET-ORIGINAL-TEXT", adminDetail.originalSourceText);

        // Publish: now visible publicly and via search, but editorial fields stay hidden from anonymous callers.
        var publish = await admin.PatchAsJsonAsync($"/api/education/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var publicListAfterPublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/education?pageSize=200");
        Assert.Contains(publicListAfterPublish!.items, item => item.id == created.id);

        var publicDetailAfterPublish = await anonymous.GetFromJsonAsync<EducationDetailBody>($"/api/education/{created.id}");
        Assert.Null(publicDetailAfterPublish!.editorialNote);
        Assert.Null(publicDetailAfterPublish.originalSourceText);

        var searchAfterPublish = await anonymous.GetFromJsonAsync<SearchBody>("/api/search?q=PUBLIC-BOUNDARY-TEST-EDUCATION");
        Assert.Contains(searchAfterPublish!.education, item => item.id == created.id);

        // Archive: disappears from the public list again.
        var archive = await admin.PatchAsJsonAsync($"/api/education/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);
        var publicListAfterArchive = await anonymous.GetFromJsonAsync<PagedBody>("/api/education?pageSize=200");
        Assert.DoesNotContain(publicListAfterArchive!.items, item => item.id == created.id);
    }

    private record EventBody(Guid id, string publicationStatus);
    private record ListingBody(Guid id, string moderationStatus);
    private record PagedItem(Guid id);
    private record PagedBody(List<PagedItem> items);
    private record EducationBody(Guid id, string publicationStatus);
    private record EducationDetailBody(Guid id, string? editorialNote, string? originalSourceText);
    private record SearchResultItemBody(Guid id);
    private record SearchBody(List<SearchResultItemBody> education);
}
