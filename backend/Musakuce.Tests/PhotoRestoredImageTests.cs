using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Musakuce.Tests;

/// <summary>
/// Fotoalbom's optional restored/enhanced image, used by the public
/// Before/After comparison slider. Covers: a photo works exactly as
/// before when no restored image is set, a restored image can be
/// attached/replaced/removed via the normal admin edit flow, and hard
/// delete doesn't error when one is present.
/// </summary>
public class PhotoRestoredImageTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    // 1x1 red pixel PNG — same fixture bytes as MediaUploadTests.
    private static readonly byte[] ValidPngBytes = Convert.FromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

    public PhotoRestoredImageTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private static async Task<Guid> UploadMediaAsync(HttpClient client)
    {
        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(ValidPngBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(fileContent, "file", "test.png");
        var response = await client.PostAsync("/api/media/upload", content);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<MediaAssetBody>())!.id;
    }

    private static object NewPhotoPayload(Guid mediaAssetId, Guid? restoredMediaAssetId = null) => new
    {
        title = "Test Photo",
        category = "KendHeyati",
        sourceStatus = "Verified",
        mediaAssetId,
        altText = "Test alt text",
        restoredMediaAssetId,
    };

    [Fact]
    public async Task A_photo_created_without_a_restored_image_has_a_null_restoredImageUrl()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var mediaId = await UploadMediaAsync(editor);

        var create = await editor.PostAsJsonAsync("/api/photos", NewPhotoPayload(mediaId));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var photo = (await create.Content.ReadFromJsonAsync<PhotoBody>())!;

        Assert.Null(photo.restoredMediaAssetId);
        Assert.Null(photo.restoredImageUrl);
    }

    [Fact]
    public async Task A_photo_created_with_a_restored_image_exposes_its_url()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var mediaId = await UploadMediaAsync(editor);
        var restoredId = await UploadMediaAsync(editor);

        var create = await editor.PostAsJsonAsync("/api/photos", NewPhotoPayload(mediaId, restoredId));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var photo = (await create.Content.ReadFromJsonAsync<PhotoBody>())!;

        Assert.Equal(restoredId, photo.restoredMediaAssetId);
        Assert.False(string.IsNullOrWhiteSpace(photo.restoredImageUrl));
    }

    [Fact]
    public async Task A_restored_image_can_be_attached_and_then_removed_via_update()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var mediaId = await UploadMediaAsync(editor);
        var restoredId = await UploadMediaAsync(editor);

        var create = await editor.PostAsJsonAsync("/api/photos", NewPhotoPayload(mediaId));
        var photo = (await create.Content.ReadFromJsonAsync<PhotoBody>())!;
        Assert.Null(photo.restoredImageUrl);

        var attach = await editor.PutAsJsonAsync($"/api/photos/{photo.id}", NewPhotoPayload(mediaId, restoredId));
        Assert.Equal(HttpStatusCode.OK, attach.StatusCode);
        var withRestored = (await attach.Content.ReadFromJsonAsync<PhotoBody>())!;
        Assert.NotNull(withRestored.restoredImageUrl);

        var detach = await editor.PutAsJsonAsync($"/api/photos/{photo.id}", NewPhotoPayload(mediaId));
        Assert.Equal(HttpStatusCode.OK, detach.StatusCode);
        var withoutRestored = (await detach.Content.ReadFromJsonAsync<PhotoBody>())!;
        Assert.Null(withoutRestored.restoredMediaAssetId);
        Assert.Null(withoutRestored.restoredImageUrl);
    }

    [Fact]
    public async Task Deleting_a_photo_with_a_restored_image_succeeds()
    {
        var editor = await _factory.AsRoleAsync(TestUsers.EditorEmail);
        var mediaId = await UploadMediaAsync(editor);
        var restoredId = await UploadMediaAsync(editor);

        var create = await editor.PostAsJsonAsync("/api/photos", NewPhotoPayload(mediaId, restoredId));
        var photo = (await create.Content.ReadFromJsonAsync<PhotoBody>())!;

        var delete = await editor.DeleteAsync($"/api/photos/{photo.id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var getAfterDelete = await editor.GetAsync($"/api/photos/{photo.id}?publicationStatus=Draft");
        Assert.Equal(HttpStatusCode.NotFound, getAfterDelete.StatusCode);
    }

    private record MediaAssetBody(Guid id);
    private record PhotoBody(Guid id, Guid? restoredMediaAssetId, string? restoredImageUrl);
}
