using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class PhotoConfiguration : IEntityTypeConfiguration<Photo>
{
    public void Configure(EntityTypeBuilder<Photo> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.UploaderName).HasMaxLength(100);

        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(x => x.MediaAsset)
            .WithMany()
            .HasForeignKey(x => x.MediaAssetId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.PublicationStatus);

        // Title/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.
    }
}
