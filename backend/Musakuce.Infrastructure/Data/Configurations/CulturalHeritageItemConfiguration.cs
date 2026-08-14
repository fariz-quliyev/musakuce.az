using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class CulturalHeritageItemConfiguration : IEntityTypeConfiguration<CulturalHeritageItem>
{
    public void Configure(EntityTypeBuilder<CulturalHeritageItem> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);

        builder.Property(x => x.Kind).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(x => x.CoverMediaAsset).WithMany().HasForeignKey(x => x.CoverMediaAssetId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.PublicationStatus);

        // Title/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.
    }
}
