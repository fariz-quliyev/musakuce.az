using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.Property(x => x.PersonName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Title).HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.Transcript).HasMaxLength(20000);
        builder.Property(x => x.EmbedUrlOrKey).IsRequired().HasMaxLength(500);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);

        builder.Property(x => x.EmbedProvider).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(x => x.ThumbnailMediaAsset).WithMany().HasForeignKey(x => x.ThumbnailMediaAssetId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.RelatedPerson).WithMany().HasForeignKey(x => x.RelatedPersonId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.PublicationStatus);

        // PersonName/Title get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.
    }
}
