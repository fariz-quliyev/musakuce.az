using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class MemorialRecordConfiguration : IEntityTypeConfiguration<MemorialRecord>
{
    public void Configure(EntityTypeBuilder<MemorialRecord> builder)
    {
        builder.Property(x => x.FullName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.FatherName).HasMaxLength(100);
        builder.Property(x => x.Biography).HasMaxLength(8000);
        builder.Property(x => x.Achievements).HasMaxLength(4000);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);

        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(x => x.CoverMediaAsset).WithMany().HasForeignKey(x => x.CoverMediaAssetId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.RelatedPerson).WithMany().HasForeignKey(x => x.RelatedPersonId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.PublicationStatus);

        // FullName gets a hand-written pg_trgm GIN expression index (on
        // lower(column)) in the Phase14SearchTrigramIndexes migration —
        // see PersonConfiguration for why it's not declared via fluent
        // HasIndex here.
    }
}
