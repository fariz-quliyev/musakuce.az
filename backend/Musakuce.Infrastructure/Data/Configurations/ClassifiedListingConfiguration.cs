using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class ClassifiedListingConfiguration : IEntityTypeConfiguration<ClassifiedListing>
{
    public void Configure(EntityTypeBuilder<ClassifiedListing> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.Location).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ContactName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ContactInfo).IsRequired().HasMaxLength(200);
        builder.Property(x => x.RejectionReason).HasMaxLength(1000);
        builder.Property(x => x.Price).HasPrecision(12, 2);

        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.ListingStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.ModerationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => new { x.ModerationStatus, x.ListingStatus });

        builder.HasMany(x => x.Images)
            .WithOne(x => x.ClassifiedListing)
            .HasForeignKey(x => x.ClassifiedListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ListingImageConfiguration : IEntityTypeConfiguration<ListingImage>
{
    public void Configure(EntityTypeBuilder<ListingImage> builder)
    {
        builder.HasOne(x => x.MediaAsset)
            .WithMany()
            .HasForeignKey(x => x.MediaAssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
