using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class HistoricalEventConfiguration : IEntityTypeConfiguration<HistoricalEvent>
{
    public void Configure(EntityTypeBuilder<HistoricalEvent> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Period).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.DetailedText).HasMaxLength(8000);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);

        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.EventIcon).HasConversion<string>().HasMaxLength(30);

        builder.HasIndex(x => x.DisplayOrder);
        builder.HasIndex(x => x.PublicationStatus);

        builder.HasOne(x => x.CoverMediaAsset).WithMany().HasForeignKey(x => x.CoverMediaAssetId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.IconMediaAsset).WithMany().HasForeignKey(x => x.IconMediaAssetId).OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.AdditionalImages)
            .WithOne(x => x.HistoricalEvent)
            .HasForeignKey(x => x.HistoricalEventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Title/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.
    }
}

public class HistoricalEventImageConfiguration : IEntityTypeConfiguration<HistoricalEventImage>
{
    public void Configure(EntityTypeBuilder<HistoricalEventImage> builder)
    {
        builder.HasOne(x => x.MediaAsset)
            .WithMany()
            .HasForeignKey(x => x.MediaAssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
