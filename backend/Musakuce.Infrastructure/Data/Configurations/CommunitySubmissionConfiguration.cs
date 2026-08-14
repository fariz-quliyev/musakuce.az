using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class CommunitySubmissionConfiguration : IEntityTypeConfiguration<CommunitySubmission>
{
    public void Configure(EntityTypeBuilder<CommunitySubmission> builder)
    {
        builder.Property(x => x.SubmitterName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ContactInfo).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.SuggestedLocation).HasMaxLength(200);
        builder.Property(x => x.PeopleShown).HasMaxLength(500);
        builder.Property(x => x.SourceNote).HasMaxLength(1000);
        builder.Property(x => x.ReviewerNote).HasMaxLength(1000);

        builder.Property(x => x.Kind).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => x.Status);

        builder.HasMany(x => x.Files)
            .WithOne(x => x.CommunitySubmission)
            .HasForeignKey(x => x.CommunitySubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SubmissionFileConfiguration : IEntityTypeConfiguration<SubmissionFile>
{
    public void Configure(EntityTypeBuilder<SubmissionFile> builder)
    {
        builder.HasOne(x => x.MediaAsset)
            .WithMany()
            .HasForeignKey(x => x.MediaAssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
