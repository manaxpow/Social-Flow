using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.Property(p => p.Content)
        .IsRequired(false)
        .HasMaxLength(1000);

        builder.Property(p => p.ReactionCount)
        .IsRequired();

        builder.Property(p => p.CommentCount)
        .IsRequired();

        builder.Property(p => p.CreatedAt)
        .IsRequired();

        builder.Property(p => p.TopReactTypes)
        .HasColumnType("jsonb");

        builder.OwnsMany(p => p.TopComments, commentBuilder =>
        {
            commentBuilder.ToJson();
        });

        builder.HasOne(p => p.Author)
        .WithMany(a => a.Posts)
        .HasForeignKey(p => p.AuthorId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}