namespace Musakuce.Infrastructure.Media;

/// <summary>
/// Bound from the "MediaStorage" configuration section. Works against
/// any S3-compatible endpoint — MinIO locally (see infra/docker-compose.yml),
/// AWS S3 or another S3-compatible provider in production. Credentials
/// MUST come from environment variables; never hard-code real ones here
/// or in appsettings — see Phase 8 report §2/§3.
///
/// Bucket/AccessKey/SecretKey are checked outside Development at
/// Program.cs startup (Phase 15 §18, same fail-fast pattern as
/// Jwt:Secret) rather than via [Required] here — a blank value in
/// Development must stay a soft warning (MediaStorageBootstrapper),
/// since not every local dev workflow runs MinIO.
/// </summary>
public class MediaStorageOptions
{
    public const string SectionName = "MediaStorage";

    /// <summary>S3-compatible endpoint URL (e.g. "http://minio:9000" in
    /// Docker dev). Leave null/empty to use AWS's default regional
    /// endpoint for a real AWS S3 bucket in production.</summary>
    public string? Endpoint { get; set; }
    public string Region { get; set; } = "us-east-1";
    public required string Bucket { get; set; }
    public required string AccessKey { get; set; }
    public required string SecretKey { get; set; }

    /// <summary>MinIO/most self-hosted S3-compatible servers require
    /// path-style URLs (https://host/bucket/key) rather than the
    /// virtual-hosted style AWS S3 defaults to (https://bucket.host/key).</summary>
    public bool ForcePathStyle { get; set; } = true;

    /// <summary>Base URL used to build public links returned to
    /// clients — e.g. "http://localhost:9000/musakuce-media" in dev,
    /// or a CDN domain in front of the bucket in production. Falls back
    /// to Endpoint + "/" + Bucket if not set.</summary>
    public string? PublicBaseUrl { get; set; }
}
