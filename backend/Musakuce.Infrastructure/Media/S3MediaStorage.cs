using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Musakuce.Application.Abstractions;

namespace Musakuce.Infrastructure.Media;

public class S3MediaStorage(IAmazonS3 client, IOptions<MediaStorageOptions> options) : IMediaStorage
{
    private readonly MediaStorageOptions _options = options.Value;

    public async Task UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        var request = new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            AutoCloseStream = false,
            // AWSSDK.S3 4.x defaults to chunked transfer with per-chunk SigV4
            // signing (STREAMING-AWS4-HMAC-SHA256-PAYLOAD), which Cloudflare
            // R2 doesn't implement and rejects. Disabling it sends a single,
            // normally-signed request body instead; verified against real R2.
            UseChunkEncoding = false,
        };
        await client.PutObjectAsync(request, ct);
    }

    public async Task<Stream> DownloadAsync(string key, CancellationToken ct = default)
    {
        var response = await client.GetObjectAsync(_options.Bucket, key, ct);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await client.DeleteObjectAsync(_options.Bucket, key, ct);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Already gone — deleting a nonexistent object is a no-op, not an error.
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await client.GetObjectMetadataAsync(_options.Bucket, key, ct);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public string GetPublicUrl(string key)
    {
        var baseUrl = _options.PublicBaseUrl?.TrimEnd('/')
            ?? $"{_options.Endpoint?.TrimEnd('/')}/{_options.Bucket}";
        return $"{baseUrl}/{key}";
    }
}
