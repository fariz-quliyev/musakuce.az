using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Musakuce.Infrastructure.Media;

/// <summary>
/// Dev/first-run convenience — creates the media bucket if it doesn't
/// exist yet and sets it to public-read (objects are fetchable by
/// anyone who has the exact key, matching how every other CDN-fronted
/// media bucket works; the bucket is NOT listable, so keys must still be
/// known — they're random GUIDs, never guessable). Idempotent, safe to
/// run on every startup. In production this is typically done once via
/// infrastructure-as-code instead, but running it here too is harmless.
/// </summary>
public static class MediaStorageBootstrapper
{
    public static async Task EnsureBucketAsync(IServiceProvider services)
    {
        var client = services.GetRequiredService<IAmazonS3>();
        var options = services.GetRequiredService<IOptions<MediaStorageOptions>>().Value;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("MediaStorageBootstrapper");

        try
        {
            var exists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(client, options.Bucket);
            if (!exists)
            {
                await client.PutBucketAsync(new PutBucketRequest { BucketName = options.Bucket, UseClientRegion = true });
                logger.LogInformation("Created media bucket {Bucket}.", options.Bucket);
            }

            var policy = $$"""
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": "*",
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::{{options.Bucket}}/*"]
                    }
                  ]
                }
                """;
            await client.PutBucketPolicyAsync(options.Bucket, policy);
        }
        catch (Exception ex)
        {
            // Non-fatal: storage may not be reachable yet in some dev
            // sequences (e.g. MinIO still starting) — uploads will
            // surface a clear error later rather than blocking API boot.
            logger.LogWarning(ex, "Could not ensure media bucket {Bucket} exists/public — uploads may fail until this is resolved.", options.Bucket);
        }
    }
}
