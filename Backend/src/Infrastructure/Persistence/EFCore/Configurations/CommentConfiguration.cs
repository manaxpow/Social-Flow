using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.OwnsOne(c => c.Media, m =>
        {
            m.Property(p => p.Url).HasColumnName("media_url");
            m.Property(p => p.PublicId).HasColumnName("media_public_id");
            m.Property(p => p.Type).HasColumnName("media_type");
        });

        builder.HasOne(c => c.ParentComment)
           .WithMany()
           .HasForeignKey(c => c.ParentCommentId)
           .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Post)
               .WithMany(p => p.Comments)
               .HasForeignKey(c => c.PostId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}