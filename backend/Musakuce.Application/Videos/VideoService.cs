using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Videos;

public class VideoService(IMusakuceDbContext db, IAuditLogService auditLog) : IVideoService
{
    public async Task<PagedResult<VideoDto>> GetPagedAsync(VideoQuery query, CancellationToken ct = default)
    {
        var videos = db.Videos.Include(v => v.ThumbnailMediaAsset).AsNoTracking().AsQueryable();

        videos = videos.Where(v => v.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            videos = videos.Where(v => v.Title.ToLower().Contains(term));
        }

        videos = videos.OrderByDescending(v => v.CreatedAt);

        var totalCount = await videos.CountAsync(ct);
        var items = await videos
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<VideoDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<VideoDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, CancellationToken ct = default)
    {
        var video = await db.Videos.Include(v => v.ThumbnailMediaAsset).AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id && v.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(Video), id);
        return ToDto(video);
    }

    public async Task<VideoDto> CreateAsync(CreateVideoRequest request, CancellationToken ct = default)
    {
        var video = new Video
        {
            Title = request.Title,
            Description = request.Description,
            EmbedProvider = request.EmbedProvider,
            EmbedUrlOrKey = request.EmbedUrlOrKey,
            Category = request.Category,
            RecordedDate = request.RecordedDate,
            SourceStatus = request.SourceStatus,
        };

        if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
        {
            var media = new MediaAsset { Url = request.ThumbnailUrl };
            db.MediaAssets.Add(media);
            video.ThumbnailMediaAsset = media;
        }

        db.Videos.Add(video);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Video), video.Id.ToString(), newValue: video.Title, ct: ct);
        return ToDto(video);
    }

    public async Task<VideoDto> UpdateAsync(Guid id, UpdateVideoRequest request, CancellationToken ct = default)
    {
        var video = await db.Videos.Include(v => v.ThumbnailMediaAsset).FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException(nameof(Video), id);

        var oldTitle = video.Title;
        video.Title = request.Title;
        video.Description = request.Description;
        video.EmbedProvider = request.EmbedProvider;
        video.EmbedUrlOrKey = request.EmbedUrlOrKey;
        video.Category = request.Category;
        video.RecordedDate = request.RecordedDate;
        video.SourceStatus = request.SourceStatus;
        video.UpdatedAt = DateTimeOffset.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl) && request.ThumbnailUrl != video.ThumbnailMediaAsset?.Url)
        {
            var media = new MediaAsset { Url = request.ThumbnailUrl };
            db.MediaAssets.Add(media);
            video.ThumbnailMediaAsset = media;
        }

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Video), video.Id.ToString(), oldValue: oldTitle, newValue: video.Title, ct: ct);
        return ToDto(video);
    }

    public async Task<VideoDto> UpdateStatusAsync(Guid id, UpdateVideoStatusRequest request, CancellationToken ct = default)
    {
        var video = await db.Videos.FirstOrDefaultAsync(v => v.Id == id, ct)
            ?? throw new NotFoundException(nameof(Video), id);

        var oldStatus = video.PublicationStatus;
        video.PublicationStatus = request.PublicationStatus;
        video.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(Video), video.Id.ToString(), oldStatus.ToString(), video.PublicationStatus.ToString(), ct);

        return ToDto(video);
    }

    private static VideoDto ToDto(Video v) => new(
        v.Id, v.Title, v.Description, v.EmbedProvider, v.EmbedUrlOrKey,
        v.ThumbnailMediaAsset?.Url, v.Category, v.RecordedDate, v.SourceStatus, v.PublicationStatus);
}
