namespace Musakuce.Application.Abstractions;

public record ProcessedImage(byte[] Bytes, string ContentType, string FileExtension, int Width, int Height);

/// <summary>The three variants generated for every uploaded photo — see
/// Phase 8 report §5 for why (public delivery vs. archival original).</summary>
public record ImageVariantSet(ProcessedImage Original, ProcessedImage Display, ProcessedImage Thumbnail);

/// <summary>
/// Decodes, validates, and re-encodes an uploaded image — implemented in
/// Infrastructure via SixLabors.ImageSharp (see Phase 8 report §6 for
/// why that library). Reads the actual file bytes/signature, not the
/// claimed Content-Type or filename extension.
/// </summary>
public interface IImageProcessor
{
    /// <summary>Throws InvalidMediaException if the bytes don't decode
    /// as one of the supported formats (JPEG/PNG/WebP/AVIF).</summary>
    Task<ImageVariantSet> ProcessAsync(Stream input, CancellationToken ct = default);
}
