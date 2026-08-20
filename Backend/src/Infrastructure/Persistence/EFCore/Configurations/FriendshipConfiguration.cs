using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class FriendshipConfiguration : IEntityTypeConfiguration<Friendship>
{
    public void Configure(EntityTypeBuilder<Friendship> builder)
    {
        builder.HasKey(f => new { f.UserId1, f.UserId2 });

        builder.HasIndex(f => f.UserId2);

        builder.Property(f => f.Status)
        .IsRequired();

        builder.HasOne(f => f.User1)
        .WithMany()
        .HasForeignKey(f => f.UserId1)
        .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.User2)
        .WithMany()
        .HasForeignKey(f => f.UserId2)
        .OnDelete(DeleteBehavior.Restrict);
    }
}