namespace Musakuce.Application.Common;

/// <summary>Thrown by services when a requested resource doesn't exist;
/// mapped to HTTP 404 by the API's global exception handler.</summary>
public class NotFoundException(string resourceName, object key)
    : Exception($"{resourceName} with id '{key}' was not found.");

/// <summary>
/// Media upload rejected the file — bad/unsupported content, corrupt
/// bytes, or a claimed type that doesn't match the actual content.
/// Mapped to HTTP 400. Message is always safe to show a client verbatim
/// (Phase 8 §10: no internal details leaked).
/// </summary>
public class InvalidMediaException(string message) : Exception(message);

/// <summary>Upload exceeded the configured size limit. Mapped to HTTP 413.</summary>
public class MediaTooLargeException(long maxBytes)
    : Exception($"File exceeds the maximum allowed size of {maxBytes / (1024 * 1024)} MB.");

/// <summary>Attempted to delete a MediaAsset that is still referenced by
/// other content — Phase 8 §11 "safe reference checking". Mapped to HTTP 409.</summary>
public class MediaInUseException(Guid mediaAssetId)
    : Exception($"MediaAsset '{mediaAssetId}' is still referenced by other content and cannot be deleted.");
