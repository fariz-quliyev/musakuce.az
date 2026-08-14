using System.Collections.Concurrent;
using Musakuce.Application.Abstractions;

namespace Musakuce.Tests;

/// <summary>
/// In-memory IMediaStorage for tests — swapped in by
/// CustomWebApplicationFactory so the test suite never needs a real
/// MinIO/S3 endpoint. IImageProcessor is NOT faked: SixLabors.ImageSharp
/// has no external dependency, so tests get genuine image validation
/// (a fake "not really an image" upload really does fail to decode).
/// </summary>
public class FakeMediaStorage : IMediaStorage
{
    private readonly ConcurrentDictionary<string, byte[]> _objects = new();

    public Task UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        content.CopyTo(ms);
        _objects[key] = ms.ToArray();
        return Task.CompletedTask;
    }

    public Task<Stream> DownloadAsync(string key, CancellationToken ct = default) =>
        Task.FromResult<Stream>(new MemoryStream(_objects[key]));

    public Task DeleteAsync(string key, CancellationToken ct = default)
    {
        _objects.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key, CancellationToken ct = default) =>
        Task.FromResult(_objects.ContainsKey(key));

    public string GetPublicUrl(string key) => $"http://fake-storage.test/{key}";

    public int ObjectCount => _objects.Count;
}
