namespace Musakuce.Application.Media;

public interface IMediaUploadService
{
    /// <summary>ADMIN-PRIVILEGED variant — larger size limit, attributed
    /// to the authenticated actor.</summary>
    Task<MediaAssetDto> UploadAdminImageAsync(Stream content, string originalFileName, long sizeBytes, CancellationToken ct = default);

    /// <summary>Public/anonymous variant used only from the community
    /// submission form — smaller size limit, always ends up attached to
    /// a Pending CommunitySubmission (never independently public).</summary>
    Task<MediaAssetDto> UploadCommunityImageAsync(Stream content, string originalFileName, long sizeBytes, CancellationToken ct = default);

    /// <summary>True if any Photo/Person/Event/LocalInfo/Video/Listing/
    /// Place/Submission/MemorialRecord/EducationEntry/CulturalHeritageItem/
    /// Interview/VillageProfile still references this MediaAsset.</summary>
    Task<bool> IsReferencedAsync(Guid mediaAssetId, CancellationToken ct = default);

    /// <summary>Deletes the MediaAsset's storage objects and DB row, but
    /// ONLY if nothing references it — throws MediaInUseException
    /// otherwise. Safe to call after replacing an image during an edit.</summary>
    Task DeleteIfUnreferencedAsync(Guid mediaAssetId, CancellationToken ct = default);
}
