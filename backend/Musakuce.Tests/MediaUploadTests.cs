using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Musakuce.Infrastructure.Data;

namespace Musakuce.Tests;

public class MediaUploadTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    // 1x1 red pixel PNG.
    private static readonly byte[] ValidPngBytes = Convert.FromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

    public MediaUploadTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.SeedAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private static MultipartFormDataContent BuildUpload(byte[] bytes, string fileName, string contentType)
    {
        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);
        return content;
    }

    [Fact]
    public async Task Anonymous_cannot_use_the_admin_upload_endpoint()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Authenticated_admin_can_upload_a_valid_image()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await client.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MediaAssetBody>();
        Assert.NotEqual(Guid.Empty, body!.id);
        Assert.False(string.IsNullOrWhiteSpace(body.url));
        Assert.False(string.IsNullOrWhiteSpace(body.thumbnailUrl));
        Assert.False(string.IsNullOrWhiteSpace(body.originalUrl));
        Assert.Equal(1, body.width);
        Assert.Equal(1, body.height);
        Assert.Equal("Image", body.mediaType);
    }

    [Theory]
    [InlineData(TestUsers.EditorEmail)]
    [InlineData(TestUsers.ArchivistEmail)]
    [InlineData(TestUsers.ModeratorEmail)]
    public async Task Every_admin_role_can_upload_since_every_role_needs_it_for_its_own_write_permission(string email)
    {
        var client = await _factory.AsRoleAsync(email);
        var response = await client.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_MIME_type_is_rejected()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await client.PostAsync(
            "/api/media/upload",
            BuildUpload("not an image"u8.ToArray(), "malware.exe", "application/octet-stream"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task File_claiming_to_be_an_image_but_with_invalid_content_is_rejected()
    {
        // Content-Type claims image/png but the bytes are garbage — the
        // actual decode (ImageSharp) must catch this, not just the
        // Content-Type header check.
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var response = await client.PostAsync(
            "/api/media/upload",
            BuildUpload("this is not really a png file"u8.ToArray(), "fake.png", "image/png"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Oversized_file_is_rejected()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);
        var oversized = new byte[17 * 1024 * 1024]; // > AdminMaxImageBytes (15 MB)
        var response = await client.PostAsync("/api/media/upload", BuildUpload(oversized, "huge.png", "image/png"));

        // Whether ASP.NET Core's multipart body limit or the service's
        // own size check catches it first, both statuses mean the same
        // thing here: rejected for being too large.
        Assert.True(
            response.StatusCode is HttpStatusCode.RequestEntityTooLarge or HttpStatusCode.BadRequest,
            $"Expected 413 or 400, got {response.StatusCode}");
    }

    [Fact]
    public async Task Community_upload_works_without_authentication()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/api/media/community-upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Community_upload_enforces_its_own_smaller_size_cap()
    {
        var client = _factory.CreateClient();
        // Between the community cap (8 MB) and the admin cap (15 MB) —
        // must be rejected here even though an admin upload would allow it.
        var mediumFile = new byte[9 * 1024 * 1024];
        var response = await client.PostAsync("/api/media/community-upload", BuildUpload(mediumFile, "medium.png", "image/png"));

        Assert.True(
            response.StatusCode is HttpStatusCode.RequestEntityTooLarge or HttpStatusCode.BadRequest,
            $"Expected 413 or 400, got {response.StatusCode}");
    }

    [Fact]
    public async Task Uploaded_media_can_be_attached_to_a_photo_and_replacing_it_cleans_up_the_old_one()
    {
        var client = await _factory.AsRoleAsync(TestUsers.AdministratorEmail);

        var firstUpload = await client.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "first.png", "image/png"));
        var firstMedia = await firstUpload.Content.ReadFromJsonAsync<MediaAssetBody>();

        var createPhoto = await client.PostAsJsonAsync("/api/photos", new
        {
            title = "MEDIA-TEST Photo",
            category = "KendHeyati",
            mediaAssetId = firstMedia!.id,
            altText = "test",
        });
        Assert.Equal(HttpStatusCode.Created, createPhoto.StatusCode);
        var photo = await createPhoto.Content.ReadFromJsonAsync<PhotoBody>();

        // Upload a replacement and point the photo at it.
        var secondUpload = await client.PostAsync("/api/media/upload", BuildUpload(ValidPngBytes, "second.png", "image/png"));
        var secondMedia = await secondUpload.Content.ReadFromJsonAsync<MediaAssetBody>();

        var updatePhoto = await client.PutAsJsonAsync($"/api/photos/{photo!.id}", new
        {
            title = "MEDIA-TEST Photo (edited)",
            category = "KendHeyati",
            mediaAssetId = secondMedia!.id,
            altText = "test edited",
        });
        Assert.Equal(HttpStatusCode.OK, updatePhoto.StatusCode);

        var updated = await updatePhoto.Content.ReadFromJsonAsync<PhotoBody>();
        Assert.Equal(secondMedia.url, updated!.imageUrl);

        // Old MediaAsset is unreferenced now — safe cleanup must have removed it.
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        var oldStillExists = await db.MediaAssets.AnyAsync(m => m.Id == firstMedia.id);
        Assert.False(oldStillExists);

        // New MediaAsset IS referenced (by the photo) — must NOT be cleaned up.
        var newStillExists = await db.MediaAssets.AnyAsync(m => m.Id == secondMedia.id);
        Assert.True(newStillExists);
    }

    [Fact]
    public async Task Community_upload_never_independently_reaches_public_photo_endpoints()
    {
        // A community-uploaded MediaAsset has no SubmissionFile/Photo
        // pointing at it until an admin explicitly converts the
        // submission — it must not appear in any public listing on its own.
        var client = _factory.CreateClient();
        var upload = await client.PostAsync("/api/media/community-upload", BuildUpload(ValidPngBytes, "test.png", "image/png"));
        var media = await upload.Content.ReadFromJsonAsync<MediaAssetBody>();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusakuceDbContext>();
        var referenced = await db.Photos.AnyAsync(p => p.MediaAssetId == media!.id);
        Assert.False(referenced);
    }

    private record MediaAssetBody(Guid id, string url, string? thumbnailUrl, string? originalUrl, int? width, int? height, string mediaType);
    private record PhotoBody(Guid id, string imageUrl);
}
