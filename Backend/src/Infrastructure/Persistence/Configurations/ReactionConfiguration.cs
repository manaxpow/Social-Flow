using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReactionConfiguration : IEntityTypeConfiguration<Reaction>
{
    public void Configure(EntityTypeBuilder<Reaction> builder)
    {
        builder.Property(r => r.ReactType)
            .IsRequired();

        builder.Property(r => r.TargetId)
            .IsRequired();

        builder.Property(r => r.TargetType)
            .IsRequired();

        // Composite index for fast lookup by target
        builder.HasIndex(r => new { r.TargetId, r.TargetType });

        builder.HasIndex(r => new { r.UserId, r.TargetId, r.TargetType }).IsUnique();
    }
}