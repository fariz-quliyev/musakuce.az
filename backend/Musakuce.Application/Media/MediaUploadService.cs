using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Media;

public class MediaUploadService(
    IMusakuceDbContext db,
    IMediaStorage storage,
    IImageProcessor imageProcessor,
    ICurrentActorContext actor,
    IAuditLogService auditLog) : IMediaUploadService
{
    /// <summary>Admin uploads go straight into the archive — generous
    /// but not unbounded.</summary>
    public const long AdminMaxImageBytes = 15 * 1024 * 1024;

    /// <summary>Anonymous community uploads get a tighter cap — same
    /// format rules, smaller blast radius.</summary>
    public const long CommunityMaxImageBytes = 8 * 1024 * 1024;

    public Task<MediaAssetDto> UploadAdminImageAsync(Stream content, string originalFileName, long sizeBytes, CancellationToken ct = default) =>
        UploadImageAsync(content, originalFileName, sizeBytes, "photos", AdminMaxImageBytes, ct);

    public Task<MediaAssetDto> UploadCommunityImageAsync(Stream content, string originalFileName, long sizeBytes, CancellationToken ct = default) =>
        UploadImageAsync(content, originalFileName, sizeBytes, "submissions", CommunityMaxImageBytes, ct);

    private async Task<MediaAssetDto> UploadImageAsync(
        Stream content, string originalFileName, long sizeBytes, string keyPrefixRoot, long maxBytes, CancellationToken ct)
    {
        if (sizeBytes <= 0)
            throw new InvalidMediaException("The uploaded file is empty.");
        if (sizeBytes > maxBytes)
            throw new MediaTooLargeException(maxBytes);

        var variants = await imageProcessor.ProcessAsync(content, ct);

        var prefix = $"{keyPrefixRoot}/{DateTimeOffset.UtcNow:yyyy/MM}/{Guid.NewGuid()}";
        var originalKey = $"{prefix}/original.{variants.Original.FileExtension}";
        var displayKey = $"{prefix}/display.webp";
        var thumbnailKey = $"{prefix}/thumb.webp";

        await storage.UploadAsync(originalKey, new MemoryStream(variants.Original.Bytes), variants.Original.ContentType, ct);
        await storage.UploadAsync(displayKey, new MemoryStream(variants.Display.Bytes), variants.Display.ContentType, ct);
        await storage.UploadAsync(thumbnailKey, new MemoryStream(variants.Thumbnail.Bytes), variants.Thumbnail.ContentType, ct);

        var mediaAsset = new MediaAsset
        {
            Url = storage.GetPublicUrl(displayKey),
            ThumbnailUrl = storage.GetPublicUrl(thumbnailKey),
            OriginalUrl = storage.GetPublicUrl(originalKey),
            StorageKeyPrefix = prefix,
            OriginalStorageKey = originalKey,
            OriginalFileName = originalFileName,
            ContentType = variants.Display.ContentType,
            SizeBytes = sizeBytes,
            Width = variants.Display.Width,
            Height = variants.Display.Height,
            MediaType = MediaType.Image,
            UploadedByUserId = actor.UserId,
        };

        db.MediaAssets.Add(mediaAsset);
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(
            keyPrefixRoot == "submissions" ? "CommunityMediaUpload" : "MediaUpload",
            nameof(MediaAsset), mediaAsset.Id.ToString(), newValue: originalFileName, ct: ct);

        return ToDto(mediaAsset);
    }

    public async Task<bool> IsReferencedAsync(Guid mediaAssetId, CancellationToken ct = default) =>
        await db.Photos.AnyAsync(p => p.MediaAssetId == mediaAssetId, ct)
        || await db.People.AnyAsync(p => p.CoverMediaAssetId == mediaAssetId, ct)
        || await db.VillageEvents.AnyAsync(e => e.CoverMediaAssetId == mediaAssetId, ct)
        || await db.LocalInfoEntries.AnyAsync(l => l.PhotoMediaAssetId == mediaAssetId, ct)
        || await db.Videos.AnyAsync(v => v.ThumbnailMediaAssetId == mediaAssetId, ct)
        || await db.ListingImages.AnyAsync(i => i.MediaAssetId == mediaAssetId, ct)
        || await db.SubmissionFiles.AnyAsync(s => s.MediaAssetId == mediaAssetId, ct)
        || await db.Places.AnyAsync(p => p.CoverMediaAssetId == mediaAssetId, ct);

    public async Task DeleteIfUnreferencedAsync(Guid mediaAssetId, CancellationToken ct = default)
    {
        if (await IsReferencedAsync(mediaAssetId, ct))
            throw new MediaInUseException(mediaAssetId);

        var mediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaAssetId, ct);
        if (mediaAsset is null) return;

        if (!string.IsNullOrWhiteSpace(mediaAsset.StorageKeyPrefix))
        {
            // Best-effort — missing keys are a no-op (see S3MediaStorage.DeleteAsync).
            if (!string.IsNullOrWhiteSpace(mediaAsset.OriginalStorageKey))
                await storage.DeleteAsync(mediaAsset.OriginalStorageKey, ct);
            await storage.DeleteAsync($"{mediaAsset.StorageKeyPrefix}/display.webp", ct);
            await storage.DeleteAsync($"{mediaAsset.StorageKeyPrefix}/thumb.webp", ct);
        }

        db.MediaAssets.Remove(mediaAsset);
        await db.SaveChangesAsync(ct);
    }

    private static MediaAssetDto ToDto(MediaAsset m) => new(
        m.Id, m.Url, m.ThumbnailUrl, m.OriginalUrl, m.OriginalFileName, m.AltText,
        m.ContentType, m.SizeBytes, m.Width, m.Height, m.MediaType, m.CreatedAt);
}
