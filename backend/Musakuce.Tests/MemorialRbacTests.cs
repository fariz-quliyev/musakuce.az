using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// A dedicated fixture (rather than reusing IClassFixture&lt;CustomWebApplicationFactory&gt;
/// directly) because xUnit creates a fresh MemorialRbacTests instance per
/// [Fact] and runs IAsyncLifetime.InitializeAsync on *that* instance every
/// time — logging in per test (this file needs 4 roles across 8 facts)
/// would repeat ~32 times and trip Program.cs's /api/auth/login rate
/// limiter (10/min, and every TestServer request shares one "unknown" IP
/// partition). A class *fixture* is constructed exactly once for the
/// whole test class regardless of fact count, so logging in here instead
/// keeps this file at exactly 4 logins total.
/// </summary>
public class MemorialRbacFixture : IAsyncLifetime
{
    public CustomWebApplicationFactory Factory { get; } = new();
    public HttpClient Admin { get; private set; } = null!;
    public HttpClient Editor { get; private set; } = null!;
    public HttpClient Archivist { get; private set; } = null!;
    public HttpClient Moderator { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await Factory.SeedAsync();
        Admin = await Factory.AsRoleAsync(TestUsers.AdministratorEmail);
        Editor = await Factory.AsRoleAsync(TestUsers.EditorEmail);
        Archivist = await Factory.AsRoleAsync(TestUsers.ArchivistEmail);
        Moderator = await Factory.AsRoleAsync(TestUsers.ModeratorEmail);
    }

    public Task DisposeAsync()
    {
        Factory.Dispose();
        return Task.CompletedTask;
    }
}

/// <summary>
/// docs/FINAL_PRE_DEPLOYMENT_AUDIT.md P1-1 — Memorial (Xatirə) moderation
/// authority must be Administrator/Editor only. Archivist may draft/edit
/// but must never approve/publish/archive a memorial record (spec §13:
/// family privacy is the reason this is gated more tightly than every
/// other archival content type). Given how sensitive this content type is
/// by the project's own design, it gets its own exhaustive test file
/// rather than sharing space with RoleAuthorizationTests.
/// </summary>
public class MemorialRbacTests(MemorialRbacFixture fixture) : IClassFixture<MemorialRbacFixture>
{
    private HttpClient Admin => fixture.Admin;
    private HttpClient Editor => fixture.Editor;
    private HttpClient Archivist => fixture.Archivist;
    private HttpClient Moderator => fixture.Moderator;
    private HttpClient Anonymous() => fixture.Factory.CreateClient();

    // ---- 1. Anonymous: denied every write/moderate action --------------

    [Fact]
    public async Task Anonymous_cannot_create_edit_or_moderate_memorial_records()
    {
        var client = Anonymous();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/memorial", NewMemorialPayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync($"/api/memorial/{Guid.NewGuid()}", NewMemorialPayload())).StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await client.PatchAsJsonAsync($"/api/memorial/{Guid.NewGuid()}/status", new { publicationStatus = "Published" })).StatusCode);
    }

    // ---- 2. Moderator: denied write and moderation ----------------------

    [Fact]
    public async Task Moderator_cannot_create_edit_or_moderate_memorial_records()
    {
        Assert.Equal(HttpStatusCode.Forbidden, (await Moderator.PostAsJsonAsync("/api/memorial", NewMemorialPayload())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Moderator.PutAsJsonAsync($"/api/memorial/{Guid.NewGuid()}", NewMemorialPayload())).StatusCode);
        Assert.Equal(
            HttpStatusCode.Forbidden,
            (await Moderator.PatchAsJsonAsync($"/api/memorial/{Guid.NewGuid()}/status", new { publicationStatus = "Published" })).StatusCode);
    }

    // ---- 3. Archivist: denied moderation/publish — the actual fix ------

    [Fact]
    public async Task Archivist_cannot_change_memorial_publication_status()
    {
        var created = await CreateMemorialAsync(Admin);

        var publish = await Archivist.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.Forbidden, publish.StatusCode);

        // Not just a Forbidden response — prove the record is provably
        // still a Draft afterwards, not silently changed anyway.
        var stillDraft = await Admin.GetFromJsonAsync<MemorialBody>($"/api/memorial/{created.id}?publicationStatus=Draft");
        Assert.Equal("Draft", stillDraft!.publicationStatus);
    }

    [Fact]
    public async Task Archivist_cannot_unpublish_or_archive_a_published_memorial_record()
    {
        var created = await CreateMemorialAsync(Admin);
        var publish = await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var unpublish = await Archivist.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Draft" });
        Assert.Equal(HttpStatusCode.Forbidden, unpublish.StatusCode);

        var archive = await Archivist.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.Forbidden, archive.StatusCode);

        var stillPublished = await Admin.GetFromJsonAsync<MemorialBody>($"/api/memorial/{created.id}");
        Assert.Equal("Published", stillPublished!.publicationStatus);
    }

    [Fact]
    public async Task Archivist_cannot_bypass_the_moderation_gate_through_the_update_endpoint()
    {
        var created = await CreateMemorialAsync(Admin);

        // A PUT (full edit — Archivist legitimately holds memorial.write)
        // must not be able to smuggle a publication-status change through,
        // even if the request body includes one alongside legitimate
        // fields: UpdateMemorialRecordRequest carries no PublicationStatus
        // property at all, so this is a schema-level guarantee as well as
        // a policy one — the extra field is simply not bound to anything.
        var update = await Archivist.PutAsJsonAsync($"/api/memorial/{created.id}", new
        {
            fullName = "Archivist Edit Attempt",
            category = "WWIIParticipant",
            publicationStatus = "Published",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var stillDraft = await Admin.GetFromJsonAsync<MemorialBody>($"/api/memorial/{created.id}?publicationStatus=Draft");
        Assert.Equal("Draft", stillDraft!.publicationStatus);
        Assert.Equal("Archivist Edit Attempt", stillDraft.fullName);
    }

    // ---- 4. Archivist: retains every other legitimate Memorial action --

    [Fact]
    public async Task Archivist_can_still_create_edit_and_view_draft_memorial_records()
    {
        var create = await Archivist.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<MemorialBody>();
        Assert.Equal("Draft", created!.publicationStatus);

        var update = await Archivist.PutAsJsonAsync($"/api/memorial/{created.id}", new
        {
            fullName = "Archivist Edited Name",
            category = "WWIIParticipant",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var draftDetail = await Archivist.GetAsync($"/api/memorial/{created.id}?publicationStatus=Draft");
        Assert.Equal(HttpStatusCode.OK, draftDetail.StatusCode);

        var draftList = await Archivist.GetFromJsonAsync<PagedBody>("/api/memorial?publicationStatus=Draft&pageSize=200");
        Assert.Contains(draftList!.items, item => item.id == created.id);
    }

    // ---- 5. Editor: allowed create/edit/publish --------------------------

    [Fact]
    public async Task Editor_can_create_edit_and_publish_memorial_records()
    {
        var create = await Editor.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<MemorialBody>();

        var update = await Editor.PutAsJsonAsync($"/api/memorial/{created!.id}", new
        {
            fullName = "Editor Edited Name",
            category = "WWIIParticipant",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var publish = await Editor.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);
        var published = await publish.Content.ReadFromJsonAsync<MemorialBody>();
        Assert.Equal("Published", published!.publicationStatus);

        var unpublish = await Editor.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Draft" });
        Assert.Equal(HttpStatusCode.OK, unpublish.StatusCode);
    }

    // ---- 6. Administrator: allowed every Memorial operation --------------

    [Fact]
    public async Task Administrator_can_create_edit_publish_and_archive_memorial_records()
    {
        var create = await Admin.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<MemorialBody>();

        var update = await Admin.PutAsJsonAsync($"/api/memorial/{created!.id}", new
        {
            fullName = "Administrator Edited Name",
            category = "WWIIParticipant",
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var publish = await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var archive = await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);
    }

    // ---- 7. Public anonymous GET: published records only -----------------

    [Fact]
    public async Task Anonymous_can_read_only_published_memorial_records()
    {
        var created = await CreateMemorialAsync(Admin);

        var anonymous = Anonymous();
        var beforePublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/memorial?pageSize=200");
        Assert.DoesNotContain(beforePublish!.items, item => item.id == created.id);

        var publish = await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        Assert.Equal(HttpStatusCode.OK, publish.StatusCode);

        var afterPublish = await anonymous.GetFromJsonAsync<PagedBody>("/api/memorial?pageSize=200");
        Assert.Contains(afterPublish!.items, item => item.id == created.id);
    }

    // ---- 8. Draft/Archived: protected from unauthorized elevated access --

    [Fact]
    public async Task Draft_memorial_records_are_protected_from_unauthorized_elevated_access()
    {
        var created = await CreateMemorialAsync(Admin);

        // Anonymous explicitly requesting non-public status: must authenticate.
        var anonymous = Anonymous();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/memorial?publicationStatus=Draft&pageSize=200")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/memorial/{created.id}?publicationStatus=Draft")).StatusCode);
        // And the safe-default (no status override) GetById must 404, not leak it.
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/memorial/{created.id}")).StatusCode);

        // Authenticated but unpermitted — Moderator holds no memorial.* permission at all.
        Assert.Equal(HttpStatusCode.Forbidden, (await Moderator.GetAsync($"/api/memorial/{created.id}?publicationStatus=Draft")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Moderator.GetAsync("/api/memorial?publicationStatus=Draft&pageSize=200")).StatusCode);

        // Archived is gated the same way as Draft.
        await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Published" });
        await Admin.PatchAsJsonAsync($"/api/memorial/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/memorial/{created.id}?publicationStatus=Archived")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Moderator.GetAsync($"/api/memorial/{created.id}?publicationStatus=Archived")).StatusCode);

        // Administrator (holds memorial.view) can still see it archived.
        var adminArchivedView = await Admin.GetAsync($"/api/memorial/{created.id}?publicationStatus=Archived");
        Assert.Equal(HttpStatusCode.OK, adminArchivedView.StatusCode);
    }

    // ---- helpers ----------------------------------------------------------

    private static object NewMemorialPayload() => new
    {
        fullName = "Test Memorial",
        category = "WWIIParticipant",
    };

    private static async Task<MemorialBody> CreateMemorialAsync(HttpClient adminClient)
    {
        var response = await adminClient.PostAsJsonAsync("/api/memorial", NewMemorialPayload());
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<MemorialBody>())!;
    }

    private record MemorialBody(Guid id, string fullName, string publicationStatus);
    private record PagedItem(Guid id);
    private record PagedBody(List<PagedItem> items);
}
