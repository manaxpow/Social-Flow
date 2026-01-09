using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReactionConfiguration : IEntityTypeConfiguration<Reaction>
{
    public void Configure(EntityTypeBuilder<Reaction> builder)
    {
        // Composite index for fast lookup by target
        builder.HasIndex(r => new { r.TargetId, r.TargetType });

        builder.HasIndex(r => new { r.UserId, r.TargetId, r.TargetType }).IsUnique();
    }
}