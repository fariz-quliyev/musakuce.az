using Musakuce.Application.Abstractions;
using Musakuce.Application.Common;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Musakuce.Infrastructure.Media;

/// <summary>
/// Image validation + variant generation via SixLabors.ImageSharp — a
/// pure-managed, actively-maintained, cross-platform (incl. Linux
/// containers) library that's the de facto standard for server-side
/// image processing in ASP.NET Core, with a first-class, ergonomic
/// resize/encode API and no native-binary dependency to manage in the
/// Docker image. Licensed under the Six Labors Split License — free for
/// this project's non-commercial community-archive use; would need a
/// commercial license only if musakuce.az started generating
/// significant revenue (documented in the Phase 8 report).
///
/// Decoding IS the validation: Image.LoadAsync reads the actual file
/// signature/content, not the client-supplied Content-Type or filename
/// extension, so a renamed .exe or corrupt file fails here regardless of
/// what it claims to be.
/// </summary>
public class ImageSharpProcessor : IImageProcessor
{
    private const int DisplayMaxDimension = 1920;
    private const int ThumbnailMaxDimension = 480;
    private const int DisplayQuality = 82;
    private const int ThumbnailQuality = 75;

    public async Task<ImageVariantSet> ProcessAsync(Stream input, CancellationToken ct = default)
    {
        using var buffer = new MemoryStream();
        await input.CopyToAsync(buffer, ct);
        var originalBytes = buffer.ToArray();
        buffer.Position = 0;

        Image image;
        try
        {
            image = await Image.LoadAsync(buffer, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            throw new InvalidMediaException("The uploaded file is not a valid or supported image.");
        }

        using (image)
        {
            var format = image.Metadata.DecodedImageFormat
                ?? throw new InvalidMediaException("The uploaded file is not a valid or supported image.");

            var original = new ProcessedImage(
                originalBytes, format.DefaultMimeType, format.FileExtensions.FirstOrDefault() ?? "bin",
                image.Width, image.Height);

            var display = EncodeVariant(image, DisplayMaxDimension, DisplayQuality);
            var thumbnail = EncodeVariant(image, ThumbnailMaxDimension, ThumbnailQuality);

            return new ImageVariantSet(original, display, thumbnail);
        }
    }

    /// <summary>Resizes (only if larger than maxDimension — never
    /// upscales) and re-encodes as WebP, the best size/quality tradeoff
    /// for public delivery per Phase 8 §6.</summary>
    private static ProcessedImage EncodeVariant(Image source, int maxDimension, int quality)
    {
        using var clone = source.Clone(ctx =>
        {
            if (source.Width > maxDimension || source.Height > maxDimension)
            {
                ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxDimension, maxDimension),
                });
            }
        });

        using var ms = new MemoryStream();
        clone.Save(ms, new WebpEncoder { Quality = quality });
        return new ProcessedImage(ms.ToArray(), "image/webp", "webp", clone.Width, clone.Height);
    }
}
