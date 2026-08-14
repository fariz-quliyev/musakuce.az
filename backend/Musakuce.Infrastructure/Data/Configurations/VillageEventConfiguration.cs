using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class VillageEventConfiguration : IEntityTypeConfiguration<VillageEvent>
{
    public void Configure(EntityTypeBuilder<VillageEvent> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.Location).IsRequired().HasMaxLength(200);
        builder.Property(x => x.OrganizerName).HasMaxLength(150);

        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => x.StartsAt);
        builder.HasIndex(x => x.PublicationStatus);

        // Title/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.

        builder.HasOne(x => x.Place)
            .WithMany()
            .HasForeignKey(x => x.PlaceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.CoverMediaAsset)
            .WithMany()
            .HasForeignKey(x => x.CoverMediaAssetId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
