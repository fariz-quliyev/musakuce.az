using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Musakuce.Infrastructure.Data;

namespace Musakuce.Tests;

/// <summary>
/// A dedicated fixture for the same reason MemorialRbacFixture exists:
/// xUnit constructs a fresh test-class instance per [Fact], so logging in
/// per test would repeat well past Program.cs's /api/auth/login rate
/// limit (10/min, one shared "unknown" IP partition across every
/// TestServer request). A class fixture logs in exactly once per role,
/// reused by every fact.
/// </summary>
public class MediaPipelineFixture : IAsyncLifetime
{
    public CustomWebApplicationFactory Factory { get; } = new();
    public HttpClient Admin { get; private set; } = null!;
    public HttpClient Moderator { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await Factory.SeedAsync();
        Admin = await Factory.AsRoleAsync(TestUsers.AdministratorEmail);
        Moderator = await Factory.AsRoleAsync(TestUsers.ModeratorEmail);
    }

    public Task DisposeAsync()
    {
        Factory.Dispose();
        return Task.CompletedTask;
    }
}

/// <summary>
/// docs/FINAL_PRE_DEPLOYMENT_AUDIT.md P1-5 — Events, Videos, and LocalInfo
/// cover/thumbnail images previously bypassed the secure media pipeline
/// entirely: the request DTOs accepted a raw URL string and the service
/// constructed `new MediaAsset { Url = <arbitrary string> }` directly,
/// with no MIME check, no ImageSharp decode, no size limit, and no
/// storage upload — completely independent of POST /api/media/upload.
/// This file proves the fix: all three now require a real MediaAssetId
/// referencing a row created through the real upload pipeline, exactly
/// like Photos/People/Places already did.
/// </summary>
public class MediaPipelineUnificationTests(MediaPipelineFixture fixture) : IClassFixture<MediaPipelineFixture>
{
    // 1x1 red pixel PNG — same fixture image MediaUploadTests.cs uses.
    private static readonly byte[] ValidPngBytes = Convert.FromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

    private HttpClient Admin => fixture.Admin;
    private HttpClient Moderator => fixture.Moderator;
    private HttpClient Anonymous() => fixture.Factory.CreateClient();

    private static MultipartFormDataContent BuildUpload(byte[] bytes, string fileName, string contentType)
    {
        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);
        return content;
    }

    private async Task<Guid> UploadRealImageAsync()
    {
        var response = await Admin.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));
        response.EnsureSuccessStatusCode();
        var media = await response.Content.ReadFromJsonAsync<MediaAssetBody>();
        return media!.id;
    }

    // ---- 1. Event cover image uses MediaAsset ---------------------------

    [Fact]
    public async Task Event_cover_image_uses_a_real_MediaAsset_from_the_upload_pipeline()
    {
        var mediaId = await UploadRealImageAsync();

        var create = await Admin.PostAsJsonAsync("/api/events", new
        {
            title = "MEDIA-PIPELINE-TEST Event",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = mediaId,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<EventBody>();
        Assert.Equal(mediaId, created!.coverMediaAssetId);
        Assert.False(string.IsNullOrWhiteSpace(created.coverImageUrl));

        // The resolved URL must genuinely come from the uploaded asset,
        // not merely echo whatever the caller sent.
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        var storedAsset = await db.MediaAssets.FirstAsync(m => m.Id == mediaId);
        Assert.Equal(storedAsset.Url, created.coverImageUrl);
    }

    // ---- 2. Video cover (thumbnail) image uses MediaAsset, embed URL intact --

    [Fact]
    public async Task Video_thumbnail_uses_a_real_MediaAsset_while_the_embed_URL_stays_a_plain_field()
    {
        var mediaId = await UploadRealImageAsync();

        var create = await Admin.PostAsJsonAsync("/api/videos", new
        {
            title = "MEDIA-PIPELINE-TEST Video",
            embedProvider = "YouTube",
            embedUrlOrKey = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailMediaAssetId = mediaId,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<VideoBody>();

        Assert.Equal(mediaId, created!.thumbnailMediaAssetId);
        Assert.False(string.IsNullOrWhiteSpace(created.thumbnailUrl));
        // The legitimate YouTube embed URL must be preserved verbatim —
        // this fix must never touch video/interview embed URL fields.
        Assert.Equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ", created.embedUrlOrKey);
    }

    // ---- 3. LocalInfo cover image uses MediaAsset ------------------------

    [Fact]
    public async Task LocalInfo_photo_uses_a_real_MediaAsset_from_the_upload_pipeline()
    {
        var mediaId = await UploadRealImageAsync();

        var create = await Admin.PostAsJsonAsync("/api/local-info", new
        {
            name = "MEDIA-PIPELINE-TEST Entry",
            kind = "Service",
            category = "Test",
            photoMediaAssetId = mediaId,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<LocalInfoBody>();
        Assert.Equal(mediaId, created!.photoMediaAssetId);
        Assert.False(string.IsNullOrWhiteSpace(created.photoUrl));
    }

    // ---- A nonexistent MediaAssetId is rejected, not silently accepted --

    [Fact]
    public async Task Create_with_a_nonexistent_MediaAssetId_is_rejected_for_all_three_entities()
    {
        var bogusId = Guid.NewGuid();

        var eventResponse = await Admin.PostAsJsonAsync("/api/events", new
        {
            title = "Bogus Media Event",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = bogusId,
        });
        Assert.Equal(HttpStatusCode.NotFound, eventResponse.StatusCode);

        var videoResponse = await Admin.PostAsJsonAsync("/api/videos", new
        {
            title = "Bogus Media Video",
            embedProvider = "YouTube",
            embedUrlOrKey = "https://youtube.com/x",
            thumbnailMediaAssetId = bogusId,
        });
        Assert.Equal(HttpStatusCode.NotFound, videoResponse.StatusCode);

        var localInfoResponse = await Admin.PostAsJsonAsync("/api/local-info", new
        {
            name = "Bogus Media LocalInfo",
            kind = "Service",
            category = "Test",
            photoMediaAssetId = bogusId,
        });
        Assert.Equal(HttpStatusCode.NotFound, localInfoResponse.StatusCode);
    }

    // ---- 9. Replacing an image cleans up the old asset safely -----------

    [Fact]
    public async Task Replacing_an_event_cover_image_cleans_up_the_old_asset()
    {
        var firstMediaId = await UploadRealImageAsync();
        var create = await Admin.PostAsJsonAsync("/api/events", new
        {
            title = "MEDIA-CLEANUP-TEST Event",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = firstMediaId,
        });
        var created = await create.Content.ReadFromJsonAsync<EventBody>();

        var secondMediaId = await UploadRealImageAsync();
        var update = await Admin.PutAsJsonAsync($"/api/events/{created!.id}", new
        {
            title = created.title,
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = secondMediaId,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        Assert.False(await db.MediaAssets.AnyAsync(m => m.Id == firstMediaId), "old, now-unreferenced asset should have been deleted");
        Assert.True(await db.MediaAssets.AnyAsync(m => m.Id == secondMediaId), "new, referenced asset must survive");
    }

    [Fact]
    public async Task Replacing_a_video_thumbnail_cleans_up_the_old_asset()
    {
        var firstMediaId = await UploadRealImageAsync();
        var create = await Admin.PostAsJsonAsync("/api/videos", new
        {
            title = "MEDIA-CLEANUP-TEST Video",
            embedProvider = "YouTube",
            embedUrlOrKey = "https://youtube.com/x",
            thumbnailMediaAssetId = firstMediaId,
        });
        var created = await create.Content.ReadFromJsonAsync<VideoBody>();

        var secondMediaId = await UploadRealImageAsync();
        var update = await Admin.PutAsJsonAsync($"/api/videos/{created!.id}", new
        {
            title = created.title,
            embedProvider = "YouTube",
            embedUrlOrKey = "https://youtube.com/x",
            thumbnailMediaAssetId = secondMediaId,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        Assert.False(await db.MediaAssets.AnyAsync(m => m.Id == firstMediaId));
        Assert.True(await db.MediaAssets.AnyAsync(m => m.Id == secondMediaId));
    }

    [Fact]
    public async Task Replacing_a_localinfo_photo_cleans_up_the_old_asset()
    {
        var firstMediaId = await UploadRealImageAsync();
        var create = await Admin.PostAsJsonAsync("/api/local-info", new
        {
            name = "MEDIA-CLEANUP-TEST Entry",
            kind = "Service",
            category = "Test",
            photoMediaAssetId = firstMediaId,
        });
        var created = await create.Content.ReadFromJsonAsync<LocalInfoBody>();

        var secondMediaId = await UploadRealImageAsync();
        var update = await Admin.PutAsJsonAsync($"/api/local-info/{created!.id}", new
        {
            name = created.name,
            kind = "Service",
            category = "Test",
            photoMediaAssetId = secondMediaId,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        Assert.False(await db.MediaAssets.AnyAsync(m => m.Id == firstMediaId));
        Assert.True(await db.MediaAssets.AnyAsync(m => m.Id == secondMediaId));
    }

    // ---- IsReferencedAsync safety-net fix: a genuinely shared asset must
    // never be deleted while ANY entity (not just the one being edited)
    // still references it. MediaUploadService.IsReferencedAsync was
    // missing MemorialRecords/EducationEntries/CulturalHeritageItems/
    // Interviews/VillageProfiles from its OR-chain before this fix — found
    // during this audit and corrected alongside the Event/Video/LocalInfo
    // bypass, since the three newly-converted services rely on the same
    // shared safety net. Normal uploads never naturally share one
    // MediaAssetId across two different entities (each upload is unique),
    // so this test manufactures that condition directly via the DbContext
    // to exercise the guard. ----------------------------------------------

    [Fact]
    public async Task An_asset_still_referenced_by_a_different_entity_type_is_never_deleted()
    {
        var sharedMediaId = await UploadRealImageAsync();

        var memorialCreate = await Admin.PostAsJsonAsync("/api/memorial", new
        {
            fullName = "MEDIA-SHARED-TEST Memorial",
            category = "WWIIParticipant",
            coverMediaAssetId = sharedMediaId,
        });
        Assert.Equal(HttpStatusCode.Created, memorialCreate.StatusCode);
        var memorial = await memorialCreate.Content.ReadFromJsonAsync<MemorialBody>();

        // Manufacture a second, independent reference to the SAME asset
        // from an EducationEntry — not reachable through the ordinary
        // upload UI (each upload mints a fresh id), but a legitimate
        // safety-net scenario if it ever happened.
        using (var scope = fixture.Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
            db.EducationEntries.Add(new Musakuce.Domain.Entities.EducationEntry
            {
                Title = "MEDIA-SHARED-TEST Education",
                Slug = "media-shared-test-education",
                Kind = Musakuce.Domain.Enums.EducationKind.SchoolHistory,
                CoverMediaAssetId = sharedMediaId,
            });
            await db.SaveChangesAsync();
        }

        // Replace the Memorial's cover image — this triggers
        // DeleteIfUnreferencedAsync(sharedMediaId). It must detect the
        // EducationEntry's reference and refuse to delete.
        var newMediaId = await UploadRealImageAsync();
        var update = await Admin.PutAsJsonAsync($"/api/memorial/{memorial!.id}", new
        {
            fullName = memorial.fullName,
            category = "WWIIParticipant",
            coverMediaAssetId = newMediaId,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        using var verifyScope = fixture.Factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        Assert.True(
            await verifyDb.MediaAssets.AnyAsync(m => m.Id == sharedMediaId),
            "asset still referenced by the EducationEntry must survive even after the Memorial stopped using it");
    }

    // ---- 8 (entity-specific slice). Unauthorized role cannot attach media
    // where write permission is required. Moderator's permission set is
    // the "village square" surface (Listings/LocalInfo/Submissions, see
    // Roles.Permissions' doc comment) — it deliberately DOES hold
    // localinfo.write, so only Events and Videos (events.write/
    // videos.write, which Moderator lacks) are the correct denial cases
    // here; LocalInfo's permission gate is covered instead by
    // RoleAuthorizationTests.Moderator_can_moderate_listings_and_write_local_info. ----

    [Fact]
    public async Task Moderator_cannot_create_events_or_videos_even_with_a_valid_MediaAssetId()
    {
        var mediaId = await UploadRealImageAsync(); // Moderator legitimately holds media.upload

        var eventResponse = await Moderator.PostAsJsonAsync("/api/events", new
        {
            title = "Should Not Be Created",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = mediaId,
        });
        Assert.Equal(HttpStatusCode.Forbidden, eventResponse.StatusCode);

        var videoResponse = await Moderator.PostAsJsonAsync("/api/videos", new
        {
            title = "Should Not Be Created",
            embedProvider = "YouTube",
            embedUrlOrKey = "https://youtube.com/x",
            thumbnailMediaAssetId = mediaId,
        });
        Assert.Equal(HttpStatusCode.Forbidden, videoResponse.StatusCode);
    }

    // ---- 11. Public pages still render images correctly ------------------

    [Fact]
    public async Task Anonymous_public_reads_see_the_correct_resolved_image_url_once_published()
    {
        var mediaId = await UploadRealImageAsync();
        var create = await Admin.PostAsJsonAsync("/api/events", new
        {
            title = "MEDIA-PUBLIC-TEST Event",
            description = "test",
            category = "Community",
            startsAt = DateTimeOffset.UtcNow.AddDays(1),
            location = "Test",
            coverMediaAssetId = mediaId,
        });
        var created = await create.Content.ReadFromJsonAsync<EventBody>();

        await Admin.PatchAsJsonAsync($"/api/events/{created!.id}/status", new { publicationStatus = "Published" });

        var anonymous = Anonymous();
        var publicList = await anonymous.GetFromJsonAsync<PagedEventBody>("/api/events?pageSize=200");
        var publicItem = publicList!.items.Single(e => e.id == created.id);
        Assert.Equal(created.coverImageUrl, publicItem.coverImageUrl);
        Assert.False(string.IsNullOrWhiteSpace(publicItem.coverImageUrl));
    }

    private record MediaAssetBody(Guid id, string url);
    private record EventBody(Guid id, string title, Guid? coverMediaAssetId, string? coverImageUrl);
    private record VideoBody(Guid id, string title, string embedUrlOrKey, Guid? thumbnailMediaAssetId, string? thumbnailUrl);
    private record LocalInfoBody(Guid id, string name, Guid? photoMediaAssetId, string? photoUrl);
    private record MemorialBody(Guid id, string fullName);
    private record PagedEventBody(List<EventBody> items);
}
