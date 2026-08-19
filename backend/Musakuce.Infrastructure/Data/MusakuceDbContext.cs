using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Domain.Entities;
using Musakuce.Infrastructure.Identity;

namespace Musakuce.Infrastructure.Data;

public class MusakuceDbContext(DbContextOptions<MusakuceDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options), IMusakuceDbContext
{
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<ClassifiedListing> ClassifiedListings => Set<ClassifiedListing>();
    public DbSet<ListingImage> ListingImages => Set<ListingImage>();
    public DbSet<VillageEvent> VillageEvents => Set<VillageEvent>();
    public DbSet<LocalInfoEntry> LocalInfoEntries => Set<LocalInfoEntry>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<PersonImage> PersonImages => Set<PersonImage>();
    public DbSet<HistoricalEvent> HistoricalEvents => Set<HistoricalEvent>();
    public DbSet<HistoricalEventImage> HistoricalEventImages => Set<HistoricalEventImage>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<CommunitySubmission> CommunitySubmissions => Set<CommunitySubmission>();
    public DbSet<SubmissionFile> SubmissionFiles => Set<SubmissionFile>();
    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();
    public DbSet<VillageProfile> VillageProfiles => Set<VillageProfile>();
    public DbSet<MemorialRecord> MemorialRecords => Set<MemorialRecord>();
    public DbSet<CulturalHeritageItem> CulturalHeritageItems => Set<CulturalHeritageItem>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<EducationEntry> EducationEntries => Set<EducationEntry>();
    public DbSet<TimelineSettings> TimelineSettings => Set<TimelineSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Backs the GIN trigram indexes added per-entity below (Phase 14
        // §3/§6) — required for pg_trgm's gin_trgm_ops operator class to
        // exist before any index can use it.
        modelBuilder.HasPostgresExtension("pg_trgm");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MusakuceDbContext).Assembly);
    }
}
