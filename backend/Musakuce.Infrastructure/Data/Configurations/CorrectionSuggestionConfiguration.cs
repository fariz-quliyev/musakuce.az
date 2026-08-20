using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class CorrectionSuggestionConfiguration : IEntityTypeConfiguration<CorrectionSuggestion>
{
    public void Configure(EntityTypeBuilder<CorrectionSuggestion> builder)
    {
        builder.Property(x => x.TargetEntityType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.TargetTitle).IsRequired().HasMaxLength(300);
        builder.Property(x => x.FieldOrSection).HasMaxLength(200);
        builder.Property(x => x.SuggestedChange).HasMaxLength(4000);
        builder.Property(x => x.AdditionalNotes).HasMaxLength(4000);
        builder.Property(x => x.SubmitterName).HasMaxLength(100);
        builder.Property(x => x.ContactInfo).HasMaxLength(200);
        builder.Property(x => x.ReviewerNote).HasMaxLength(1000);

        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => new { x.TargetEntityType, x.TargetEntityId });

        builder.HasOne(x => x.PhotoMediaAsset)
            .WithMany()
            .HasForeignKey(x => x.PhotoMediaAssetId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
