using System.Net;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// Admin → Tariximiz → Dərc edilmiş: "Dərci geri götür" is replaced with
/// a hard "Sil" for published rows. Covers: the delete endpoint actually
/// removes the record (not a soft/status change), it's gated on the same
/// Permissions.HistoryModerate policy as publish/archive (no separate
/// delete tier, mirroring PeopleController's precedent), and Archive
/// remains a genuinely distinct, still-working operation.
/// </summary>
public class HistoryDeleteTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public HistoryDeleteTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private static object NewEventPayload(string title) => new
    {
        title,
        period = "1930-cu illər",
        description = "Test description",
        sourceStatus = "Verified",
        eventIcon = "General",
        showInTimeline = true,
    };

    private static async Task<EventBody> CreateEventAsync(HttpClient client, string title = "Test Event")
    {
        var response = await client.PostAsJsonAsync("/api/history", NewEventPayload(title));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<EventBody>())!;
    }

    [Fact]
    public async Task Editor_can_hard_delete_a_history_event_and_it_is_actually_gone()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var created = await CreateEventAsync(editor);

        var delete = await editor.DeleteAsync($"/api/history/{created.id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        // Not archived, not draft — genuinely gone, even to a privileged viewer.
        var getArchived = await editor.GetAsync($"/api/history/{created.id}?publicationStatus=Archived");
        Assert.Equal(HttpStatusCode.NotFound, getArchived.StatusCode);
        var getPublished = await editor.GetAsync($"/api/history/{created.id}?publicationStatus=Published");
        Assert.Equal(HttpStatusCode.NotFound, getPublished.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_delete_a_history_event()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var created = await CreateEventAsync(editor);

        var anonymous = _factory.CreateClient();
        var delete = await anonymous.DeleteAsync($"/api/history/{created.id}");
        Assert.Equal(HttpStatusCode.Unauthorized, delete.StatusCode);

        var stillThere = await editor.GetAsync($"/api/history/{created.id}?publicationStatus=Published");
        Assert.Equal(HttpStatusCode.OK, stillThere.StatusCode);
    }

    [Fact]
    public async Task Moderator_without_history_permissions_cannot_delete_a_history_event()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var moderator = await _factory.AsRoleAsync(TestUsers.ModeratorEmail);
        var created = await CreateEventAsync(editor);

        var delete = await moderator.DeleteAsync($"/api/history/{created.id}");
        Assert.Equal(HttpStatusCode.Forbidden, delete.StatusCode);
    }

    [Fact]
    public async Task Archive_remains_a_distinct_operation_from_delete()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var created = await CreateEventAsync(editor);

        var archive = await editor.PatchAsJsonAsync($"/api/history/{created.id}/status", new { publicationStatus = "Archived" });
        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);

        // Archived, not deleted — still fetchable at the Archived status.
        var stillThere = await editor.GetAsync($"/api/history/{created.id}?publicationStatus=Archived");
        Assert.Equal(HttpStatusCode.OK, stillThere.StatusCode);

        // Delete afterwards still works independently.
        var delete = await editor.DeleteAsync($"/api/history/{created.id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        var goneNow = await editor.GetAsync($"/api/history/{created.id}?publicationStatus=Archived");
        Assert.Equal(HttpStatusCode.NotFound, goneNow.StatusCode);
    }

    [Fact]
    public async Task Deleting_a_nonexistent_history_event_returns_404()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);

        var delete = await editor.DeleteAsync($"/api/history/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);
    }

    private record EventBody(Guid id, string title);
}
