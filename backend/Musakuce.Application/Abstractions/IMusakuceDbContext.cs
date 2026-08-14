using Microsoft.EntityFrameworkCore;
using Musakuce.Domain.Entities;

namespace Musakuce.Application.Abstractions;

/// <summary>
/// Decouples Application-layer services from the concrete EF Core
/// provider (Npgsql) — Infrastructure's DbContext implements this, so
/// Application never references Infrastructure directly.
/// </summary>
public interface IMusakuceDbContext
{
    DbSet<MediaAsset> MediaAssets { get; }
    DbSet<Place> Places { get; }
    DbSet<ClassifiedListing> ClassifiedListings { get; }
    DbSet<ListingImage> ListingImages { get; }
    DbSet<VillageEvent> VillageEvents { get; }
    DbSet<LocalInfoEntry> LocalInfoEntries { get; }
    DbSet<Person> People { get; }
    DbSet<HistoricalEvent> HistoricalEvents { get; }
    DbSet<Photo> Photos { get; }
    DbSet<Video> Videos { get; }
    DbSet<CommunitySubmission> CommunitySubmissions { get; }
    DbSet<SubmissionFile> SubmissionFiles { get; }
    DbSet<AuditLogEntry> AuditLogEntries { get; }
    DbSet<VillageProfile> VillageProfiles { get; }
    DbSet<MemorialRecord> MemorialRecords { get; }
    DbSet<CulturalHeritageItem> CulturalHeritageItems { get; }
    DbSet<Interview> Interviews { get; }
    DbSet<EducationEntry> EducationEntries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
