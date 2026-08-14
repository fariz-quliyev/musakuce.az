using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.VillageProfiles;

/// <summary>Singleton content type — at most one row ever exists. See
/// VillageProfile entity doc comment for the Draft/Published rationale.</summary>
public class VillageProfileService(IMusakuceDbContext db, IAuditLogService auditLog) : IVillageProfileService
{
    public async Task<VillageProfileDto?> GetAsync(PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var profile = await db.VillageProfiles
            .Include(p => p.HeroMediaAsset)
            .Include(p => p.LogoMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct);
        return profile is null ? null : ToDto(profile, includeEditorial);
    }

    public async Task<VillageProfileDto> UpsertAsync(UpsertVillageProfileRequest request, CancellationToken ct = default)
    {
        var profile = await db.VillageProfiles
            .Include(p => p.HeroMediaAsset)
            .Include(p => p.LogoMediaAsset)
            .FirstOrDefaultAsync(ct);
        var isNew = profile is null;
        profile ??= new VillageProfile { VillageName = request.VillageName, ShortDescription = request.ShortDescription };

        profile.VillageName = request.VillageName;
        profile.Tagline = request.Tagline;
        profile.ShortDescription = request.ShortDescription;
        profile.LongDescription = request.LongDescription;
        profile.Population = request.Population;
        profile.PopulationAsOfYear = request.PopulationAsOfYear;
        profile.AreaHectares = request.AreaHectares;
        profile.GeographicalDescription = request.GeographicalDescription;
        profile.MainOccupations = request.MainOccupations;
        profile.NeighboringSettlements = request.NeighboringSettlements;
        profile.NameOriginNarrative = request.NameOriginNarrative;
        profile.NameOriginSourceStatus = request.NameOriginSourceStatus;
        profile.NameOriginSourceReference = request.NameOriginSourceReference;
        profile.Latitude = request.Latitude;
        profile.Longitude = request.Longitude;
        profile.ContactInfo = request.ContactInfo;
        profile.SocialLinks = request.SocialLinks;
        profile.EditorialNote = request.EditorialNote;
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.HeroMediaAssetId != profile.HeroMediaAssetId)
        {
            profile.HeroMediaAsset = request.HeroMediaAssetId is { } heroId
                ? await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == heroId, ct) ?? throw new NotFoundException(nameof(MediaAsset), heroId)
                : null;
            if (request.HeroMediaAssetId is null) profile.HeroMediaAssetId = null;
        }

        if (request.LogoMediaAssetId != profile.LogoMediaAssetId)
        {
            profile.LogoMediaAsset = request.LogoMediaAssetId is { } logoId
                ? await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == logoId, ct) ?? throw new NotFoundException(nameof(MediaAsset), logoId)
                : null;
            if (request.LogoMediaAssetId is null) profile.LogoMediaAssetId = null;
        }

        if (isNew) db.VillageProfiles.Add(profile);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync(isNew ? "Create" : "Update", nameof(VillageProfile), profile.Id.ToString(), newValue: profile.VillageName, ct: ct);
        return ToDto(profile, includeEditorial: true);
    }

    public async Task<VillageProfileDto> UpdateStatusAsync(UpdateVillageProfileStatusRequest request, CancellationToken ct = default)
    {
        var profile = await db.VillageProfiles
            .Include(p => p.HeroMediaAsset)
            .Include(p => p.LogoMediaAsset)
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException(nameof(VillageProfile), "singleton");

        var oldStatus = profile.PublicationStatus;
        profile.PublicationStatus = request.PublicationStatus;
        profile.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(VillageProfile), profile.Id.ToString(), oldStatus.ToString(), profile.PublicationStatus.ToString(), ct);
        return ToDto(profile, includeEditorial: true);
    }

    private static VillageProfileDto ToDto(VillageProfile p, bool includeEditorial) => new(
        p.Id, p.VillageName, p.Tagline, p.ShortDescription, p.LongDescription,
        p.Population, p.PopulationAsOfYear, p.AreaHectares, p.GeographicalDescription,
        p.MainOccupations, p.NeighboringSettlements, p.NameOriginNarrative,
        p.NameOriginSourceStatus, p.NameOriginSourceReference, p.Latitude, p.Longitude,
        p.HeroMediaAssetId, p.HeroMediaAsset?.Url, p.LogoMediaAssetId, p.LogoMediaAsset?.Url,
        p.ContactInfo, p.SocialLinks, includeEditorial ? p.EditorialNote : null,
        p.PublicationStatus, p.UpdatedAt);
}
