using Musakuce.Domain.Enums;

namespace Musakuce.Application.Media;

public record MediaAssetDto(
    Guid Id,
    string Url,
    string? ThumbnailUrl,
    string? OriginalUrl,
    string? OriginalFileName,
    string? AltText,
    string? ContentType,
    long? SizeBytes,
    int? Width,
    int? Height,
    MediaType MediaType,
    DateTimeOffset CreatedAt
);
