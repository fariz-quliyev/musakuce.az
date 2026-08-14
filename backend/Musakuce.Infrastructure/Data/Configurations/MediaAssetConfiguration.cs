using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class MediaAssetConfiguration : IEntityTypeConfiguration<MediaAsset>
{
    public void Configure(EntityTypeBuilder<MediaAsset> builder)
    {
        builder.Property(x => x.Url).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.ThumbnailUrl).HasMaxLength(2000);
        builder.Property(x => x.OriginalUrl).HasMaxLength(2000);
        builder.Property(x => x.StorageKeyPrefix).HasMaxLength(500);
        builder.Property(x => x.OriginalStorageKey).HasMaxLength(500);
        builder.Property(x => x.OriginalFileName).HasMaxLength(255);
        builder.Property(x => x.AltText).HasMaxLength(300);
        builder.Property(x => x.ContentType).HasMaxLength(100);
        builder.Property(x => x.MediaType).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => x.StorageKeyPrefix);
        builder.HasIndex(x => x.UploadedByUserId);
    }
}
