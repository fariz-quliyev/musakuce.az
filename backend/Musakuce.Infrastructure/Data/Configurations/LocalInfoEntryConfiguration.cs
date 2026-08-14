using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class LocalInfoEntryConfiguration : IEntityTypeConfiguration<LocalInfoEntry>
{
    public void Configure(EntityTypeBuilder<LocalInfoEntry> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ContactInfo).HasMaxLength(200);
        builder.Property(x => x.AreaServed).HasMaxLength(200);

        builder.Property(x => x.Kind).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(x => x.PublicationStatus);

        // Name/Description get a hand-written pg_trgm GIN expression
        // index (on lower(column)) in the Phase14SearchTrigramIndexes
        // migration — see PersonConfiguration for why it's not declared
        // via fluent HasIndex here.

        builder.HasOne(x => x.PhotoMediaAsset)
            .WithMany()
            .HasForeignKey(x => x.PhotoMediaAssetId)
            .OnDelete(DeleteBehavior.SetNull);

        // Self-referencing FK for attached recommendations — Restrict to
        // avoid multiple-cascade-path errors on SQL Server-style
        // providers (Postgres allows it, but this keeps behavior
        // predictable either way): deleting an entry with recommendations
        // attached must detach them explicitly, not silently orphan-cascade.
        builder.HasOne(x => x.AttachedToEntry)
            .WithMany()
            .HasForeignKey(x => x.AttachedToEntryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
