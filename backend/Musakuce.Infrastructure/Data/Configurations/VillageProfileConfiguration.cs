using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class VillageProfileConfiguration : IEntityTypeConfiguration<VillageProfile>
{
    public void Configure(EntityTypeBuilder<VillageProfile> builder)
    {
        builder.Property(x => x.VillageName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Tagline).HasMaxLength(200);
        builder.Property(x => x.ShortDescription).IsRequired().HasMaxLength(500);
        builder.Property(x => x.LongDescription).HasMaxLength(8000);
        builder.Property(x => x.AreaHectares).HasPrecision(10, 2);
        builder.Property(x => x.GeographicalDescription).HasMaxLength(2000);
        builder.Property(x => x.MainOccupations).HasMaxLength(500);
        builder.Property(x => x.NeighboringSettlements).HasMaxLength(500);
        builder.Property(x => x.NameOriginNarrative).HasMaxLength(4000);
        builder.Property(x => x.NameOriginSourceReference).HasMaxLength(500);
        builder.Property(x => x.Latitude).HasPrecision(9, 6);
        builder.Property(x => x.Longitude).HasPrecision(9, 6);
        builder.Property(x => x.CtaText).HasMaxLength(60);
        builder.Property(x => x.CtaLink).HasMaxLength(300);
        builder.Property(x => x.ContactInfo).HasMaxLength(500);
        builder.Property(x => x.SocialLinks).HasMaxLength(500);
        builder.Property(x => x.EditorialNote).HasMaxLength(2000);

        builder.Property(x => x.NameOriginSourceStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.PublicationStatus).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(x => x.HeroMediaAsset).WithMany().HasForeignKey(x => x.HeroMediaAssetId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.LogoMediaAsset).WithMany().HasForeignKey(x => x.LogoMediaAssetId).OnDelete(DeleteBehavior.SetNull);
    }
}
