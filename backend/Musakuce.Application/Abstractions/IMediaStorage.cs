namespace Musakuce.Application.Abstractions;

/// <summary>
/// S3-compatible object storage abstraction (Phase 8) — the Application
/// layer never knows whether the concrete implementation is MinIO, AWS
/// S3, or another S3-compatible provider. Implemented in Infrastructure
/// via the AWS SDK's S3 client pointed at a configurable endpoint.
/// </summary>
public interface IMediaStorage
{
    Task UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default);
    Task<Stream> DownloadAsync(string key, CancellationToken ct = default);
    Task DeleteAsync(string key, CancellationToken ct = default);
    Task<bool> ExistsAsync(string key, CancellationToken ct = default);

    /// <summary>Public URL a browser can load this object from directly
    /// (the bucket/CDN is configured for public read — see Phase 8 report
    /// §1 for why originals aren't world-listable but are fetchable by key).</summary>
    string GetPublicUrl(string key);
}
