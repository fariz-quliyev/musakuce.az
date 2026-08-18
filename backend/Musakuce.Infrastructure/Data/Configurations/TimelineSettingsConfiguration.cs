using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class TimelineSettingsConfiguration : IEntityTypeConfiguration<TimelineSettings>
{
    public void Configure(EntityTypeBuilder<TimelineSettings> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Subtitle).IsRequired().HasMaxLength(500);
        builder.Property(x => x.DefaultSelection).IsRequired().HasMaxLength(10);
        builder.Property(x => x.MobileBehavior).IsRequired().HasMaxLength(30);
    }
}
