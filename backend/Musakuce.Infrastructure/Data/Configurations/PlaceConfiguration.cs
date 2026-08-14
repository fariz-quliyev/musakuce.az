using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class PlaceConfiguration : IEntityTypeConfiguration<Place>
{
    public void Configure(EntityTypeBuilder<Place> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(180);
        builder.HasIndex(x => x.Slug).IsUnique();

        builder.Property(x => x.Kind).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.Property(x => x.Latitude).HasPrecision(9, 6);
        builder.Property(x => x.Longitude).HasPrecision(9, 6);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);

        builder.HasOne(x => x.CoverMediaAsset)
            .WithMany()
            .HasForeignKey(x => x.CoverMediaAssetId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.PublicationStatus);

        // Name/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.
    }
}
