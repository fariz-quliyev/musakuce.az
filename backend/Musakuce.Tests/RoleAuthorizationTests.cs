using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// End-to-end authorization tests — real HTTP requests through the real
/// controller/policy pipeline (see CustomWebApplicationFactory), against
/// an isolated InMemory database. Covers the "at minimum" checklist from
/// the Phase 7 spec: anonymous denial, per-role permitted/restricted
/// access, and that public GETs stay open.
/// </summary>
public class RoleAuthorizationTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public RoleAuthorizationTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    // ---- Anonymous ---------------------------------------------------

    [Fact]
    public async Task Anonymous_cannot_create_a_local_info_entry()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/local-info", new { name = "Test", kind = "Service", category = "Test" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_request_pending_listings()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/listings?moderationStatus=Pending");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_list_users()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_can_read_published_listings()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/listings");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_create_a_place()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/places", NewPlacePayload());
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_can_read_published_places()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/places");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_write_phase12_content_types()
    {
        var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/memorial", NewMemorialPayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/cultural-heritage", NewCulturalHeritagePayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/interviews", NewInterviewPayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/village-profile", NewVillageProfilePayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/education", NewEducationPayload())).StatusCode);
    }

    [Fact]
    public async Task Anonymous_can_read_published_phase12_content_types()
    {
        var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/memorial")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/cultural-heritage")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/interviews")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/education")).StatusCode);
        // No village profile published yet in this isolated test DB — 404 is correct, not an error.
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/village-profile")).StatusCode);
    }

    [Fact]
    public async Task Anonymous_can_submit_a_community_submission()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/submissions", new
        {
            submitterName = "Test",
            contactInfo = "test@example.com",
            kind = "Memory",
            description = "test",
            permissionToPublish = true,
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_bearer_token_is_rejected()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", "not-a-real-token");
        var response = await client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ---- Administrator: full access -----------------------------------

    [Fact]
    public async Task Administrator_has_full_access()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var events = await client.PostAsJsonAsync("/api/events", NewEventPayload());
        Assert.Equal(HttpStatusCode.Created, events.StatusCode);

        var localInfo = await client.PostAsJsonAsync("/api/local-info", NewLocalInfoPayload());
        Assert.Equal(HttpStatusCode.Created, localInfo.StatusCode);

        var users = await client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.OK, users.StatusCode);

        var auditLog = await client.GetAsync("/api/audit-log");
        Assert.Equal(HttpStatusCode.OK, auditLog.StatusCode);
    }

    // ---- Editor: village content permitted, local-info restricted -----

    [Fact]
    public async Task Editor_can_create_events_people_and_places()
    {
        var client = await _factory.AsRoleAsync(TestUsers.EditorEmail);

        var events = await client.PostAsJsonAsync("/api/events", NewEventPayload());
        Assert.Equal(HttpStatusCode.Created, events.StatusCode);

        var people = await client.PostAsJsonAsync("/api/people", NewPersonPayload());
        Assert.Equal(HttpStatusCode.Created, people.StatusCode);

        var places = await client.PostAsJsonAsync("/api/places", NewPlacePayload());
        Assert.Equal(HttpStatusCode.Created, places.StatusCode);

        var memorial = await client.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        Assert.Equal(HttpStatusCode.Created, memorial.StatusCode);

        var culturalHeritage = await client.PostAsJsonAsync("/api/cultural-heritage", NewCulturalHeritagePayload());
        Assert.Equal(HttpStatusCode.Created, culturalHeritage.StatusCode);

        var interview = await client.PostAsJsonAsync("/api/interviews", NewInterviewPayload());
        Assert.Equal(HttpStatusCode.Created, interview.StatusCode);

        var villageProfile = await client.PutAsJsonAsync("/api/village-profile", NewVillageProfilePayload());
        Assert.Equal(HttpStatusCode.OK, villageProfile.StatusCode);

        var education = await client.PostAsJsonAsync("/api/education", NewEducationPayload());
        Assert.Equal(HttpStatusCode.Created, education.StatusCode);
    }

    [Fact]
    public async Task Editor_cannot_write_local_info()
    {
        var client = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var response = await client.PostAsJsonAsync("/api/local-info", NewLocalInfoPayload());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Editor_cannot_manage_users()
    {
        var client = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var response = await client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // ---- Archivist: archival content permitted, events restricted -----

    [Fact]
    public async Task Archivist_can_write_people_and_history()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ArchivistEmail);

        var people = await client.PostAsJsonAsync("/api/people", NewPersonPayload());
        Assert.Equal(HttpStatusCode.Created, people.StatusCode);

        var history = await client.PostAsJsonAsync("/api/history", NewHistoryPayload());
        Assert.Equal(HttpStatusCode.Created, history.StatusCode);
    }

    [Fact]
    public async Task Archivist_cannot_write_events()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ArchivistEmail);
        var response = await client.PostAsJsonAsync("/api/events", NewEventPayload());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Archivist_cannot_write_listings()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ArchivistEmail);
        var response = await client.PutAsJsonAsync($"/api/listings/{Guid.NewGuid()}", NewListingPayload());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // ---- Moderator: listings/local-info/submissions, archive restricted -

    [Fact]
    public async Task Moderator_can_moderate_listings_and_write_local_info()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);

        var localInfo = await client.PostAsJsonAsync("/api/local-info", NewLocalInfoPayload());
        Assert.Equal(HttpStatusCode.Created, localInfo.StatusCode);

        // Nonexistent id — proves the request cleared authorization
        // (404 from the service, not 401/403 from the policy gate).
        var moderate = await client.PatchAsJsonAsync($"/api/listings/{Guid.NewGuid()}/status", new { moderationStatus = "Approved" });
        Assert.Equal(HttpStatusCode.NotFound, moderate.StatusCode);
    }

    [Fact]
    public async Task Moderator_cannot_write_people_places_or_phase12_content_types()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);

        var people = await client.PostAsJsonAsync("/api/people", NewPersonPayload());
        Assert.Equal(HttpStatusCode.Forbidden, people.StatusCode);

        var places = await client.PostAsJsonAsync("/api/places", NewPlacePayload());
        Assert.Equal(HttpStatusCode.Forbidden, places.StatusCode);

        var memorial = await client.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        Assert.Equal(HttpStatusCode.Forbidden, memorial.StatusCode);

        var villageProfile = await client.PutAsJsonAsync("/api/village-profile", NewVillageProfilePayload());
        Assert.Equal(HttpStatusCode.Forbidden, villageProfile.StatusCode);

        var education = await client.PostAsJsonAsync("/api/education", NewEducationPayload());
        Assert.Equal(HttpStatusCode.Forbidden, education.StatusCode);
    }

    [Fact]
    public async Task Moderator_cannot_manage_users_or_view_audit_log()
    {
        var client = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/audit-log")).StatusCode);
    }

    // ---- helpers --------------------------------------------------------

    private static object NewEventPayload() => new
    {
        title = "Test Event",
        description = "test",
        category = "Community",
        startsAt = DateTimeOffset.UtcNow.AddDays(1),
        location = "Test",
    };

    private static object NewLocalInfoPayload() => new
    {
        name = "Test Entry",
        kind = "Service",
        category = "Test",
    };

    private static object NewPersonPayload() => new
    {
        firstName = "Test",
        lastName = "Person",
        category = "Other",
        biography = "test bio",
    };

    private static object NewHistoryPayload() => new
    {
        title = "Test Event",
        period = "2026",
        description = "test",
    };

    private static object NewListingPayload() => new
    {
        title = "Test Listing",
        description = "test",
        category = "AlqiSatqi",
        location = "Test",
        contactName = "Test",
        contactInfo = "test@example.com",
    };

    private static object NewPlacePayload() => new
    {
        name = "Test Place",
        kind = "Useful",
        category = "Shop",
        latitude = 39.00861,
        longitude = 48.69889,
    };

    private static object NewMemorialPayload() => new
    {
        fullName = "Test Memorial",
        category = "WWIIParticipant",
    };

    private static object NewCulturalHeritagePayload() => new
    {
        title = "Test Heritage Item",
        kind = "Tradition",
        description = "test",
    };

    private static object NewInterviewPayload() => new
    {
        personName = "Test Interviewee",
        embedProvider = "YouTube",
        embedUrlOrKey = "test-key",
    };

    private static object NewVillageProfilePayload() => new
    {
        villageName = "Test Village",
        shortDescription = "test",
    };

    private static object NewEducationPayload() => new
    {
        title = "Test Education Entry",
        kind = "SchoolHistory",
    };
}
