using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.Property(p => p.Content)
        .IsRequired(false)
        .HasMaxLength(10000);

        builder.Property(p => p.ReactionCount)
        .IsRequired();

        builder.Property(p => p.CommentCount)
        .IsRequired();

        builder.Property(p => p.CreatedAt)
        .IsRequired();

        builder.HasMany(p => p.MediaItems)
           .WithOne()
           .HasForeignKey(m => m.PostId)
           .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Mentions)
            .WithOne(m => m.Post)
            .HasForeignKey(m => m.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Author)
        .WithMany(a => a.Posts)
        .HasForeignKey(p => p.AuthorId)
        .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.SharedPost)
           .WithMany(p => p.Shares)
           .HasForeignKey(p => p.SharedPostId)
           .OnDelete(DeleteBehavior.Restrict);
    }
}