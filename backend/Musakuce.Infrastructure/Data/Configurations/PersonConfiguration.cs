using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> builder)
    {
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.FatherName).HasMaxLength(100);
        builder.Property(x => x.Occupation).HasMaxLength(150);
        // 16000 (not the original 8000) — a biography can now carry inline
        // <img> tags from the RichTextEditor's image button, and each one
        // costs ~120-170 chars (R2 URL + alt text), which ate into the old
        // limit fast for a biography with even a few images.
        builder.Property(x => x.Biography).IsRequired().HasMaxLength(16000);
        builder.Property(x => x.SourceReference).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);
        builder.Property(x => x.OriginalSourceText).HasMaxLength(8000);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(180);
        builder.HasIndex(x => x.Slug).IsUnique();

        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.SourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);
        // Every public list query filters on this first (Phase 14 §3) —
        // same rationale applied identically across every content type below.
        builder.HasIndex(x => x.PublicationStatus);

        // FirstName/LastName additionally get a hand-written pg_trgm GIN
        // expression index in the Phase14SearchTrigramIndexes migration
        // (on lower(column), matching SearchService.cs's query shape) —
        // not declared here because EF's fluent HasIndex can't express an
        // index over a function call like lower(x), only over raw
        // properties.

        builder.HasOne(x => x.CoverMediaAsset)
            .WithMany()
            .HasForeignKey(x => x.CoverMediaAssetId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.AdditionalImages)
            .WithOne(x => x.Person)
            .HasForeignKey(x => x.PersonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PersonImageConfiguration : IEntityTypeConfiguration<PersonImage>
{
    public void Configure(EntityTypeBuilder<PersonImage> builder)
    {
        builder.HasOne(x => x.MediaAsset)
            .WithMany()
            .HasForeignKey(x => x.MediaAssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
