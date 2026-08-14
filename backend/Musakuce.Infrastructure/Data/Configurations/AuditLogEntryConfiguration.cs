using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Musakuce.Domain.Entities;

namespace Musakuce.Infrastructure.Data.Configurations;

public class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.Property(x => x.Action).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ActorEmail).HasMaxLength(256);
        builder.Property(x => x.ActorDisplayName).HasMaxLength(150);
        builder.Property(x => x.EntityType).HasMaxLength(100);
        builder.Property(x => x.EntityId).HasMaxLength(100);
        builder.Property(x => x.OldValue).HasMaxLength(2000);
        builder.Property(x => x.NewValue).HasMaxLength(2000);
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasMaxLength(500);

        builder.HasIndex(x => x.Timestamp);
        builder.HasIndex(x => x.ActorUserId);
        builder.HasIndex(x => x.EntityType);
        builder.HasIndex(x => x.Action);
    }
}
